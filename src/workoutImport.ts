import type { Exercise, WorkoutTemplate } from './types'

const clean = (v: unknown) => String(v ?? '').trim()
const num = (v: unknown, fallback: number) => {
  const n = Number(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) ? n : fallback
}
const key = (s: string) => s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g,'')

function parseReps(value: unknown, minFallback=8, maxFallback=12){
  const s=clean(value)
  const match=s.match(/(\d+)\s*[-–a]\s*(\d+)/i)
  if(match) return {min:+match[1],max:+match[2]}
  const single=s.match(/\d+/)
  if(single){const n=+single[0];return {min:n,max:n}}
  return {min:minFallback,max:maxFallback}
}

function normalizeExercise(raw: Record<string, unknown>, index:number, prefix:string): Exercise {
  const reps=parseReps(raw.repeticoes ?? raw.reps ?? raw.rep_range, num(raw.repMin ?? raw.reps_min,8), num(raw.repMax ?? raw.reps_max,12))
  const name=clean(raw.exercicio ?? raw.exercise ?? raw.name) || `Exercício ${index+1}`
  return {
    id:`${prefix}-${index}-${key(name)||'ex'}`,
    name,
    muscle:clean(raw.musculo ?? raw.muscle) || 'Geral',
    sets:Math.max(1,Math.round(num(raw.series ?? raw.sets,3))),
    repMin:Math.max(1,Math.round(reps.min)),
    repMax:Math.max(1,Math.round(reps.max)),
    rest:Math.max(0,Math.round(num(raw.descanso ?? raw.rest ?? raw.rest_seconds,60))),
    spineStress:'MODERATE',
    trekking:false,
    notes:clean(raw.observacoes ?? raw.notes) || 'Treino importado: revise técnica, amplitude e tolerância antes de progredir carga.'
  }
}

function normalizeWorkout(raw: Record<string, unknown>, index:number): WorkoutTemplate {
  const title=clean(raw.treino ?? raw.title ?? raw.name) || `Treino importado ${index+1}`
  const exercisesRaw=Array.isArray(raw.exercises) ? raw.exercises : []
  const prefix=`custom-${Date.now()}-${index}`
  return {
    id:prefix,
    title,
    focus:clean(raw.foco ?? raw.focus) || 'Treino importado',
    cardio:clean(raw.cardio) || undefined,
    source:'imported',
    importedAt:new Date().toISOString(),
    exercises:exercisesRaw.map((x,i)=>normalizeExercise((x||{}) as Record<string,unknown>,i,prefix))
  }
}

function splitCsvLine(line:string, delimiter:string){
  const out:string[]=[]; let cur=''; let quoted=false
  for(let i=0;i<line.length;i++){
    const ch=line[i]
    if(ch==='"'){
      if(quoted && line[i+1]==='"'){cur+='"';i++}
      else quoted=!quoted
    } else if(ch===delimiter && !quoted){out.push(cur.trim());cur=''}
    else cur+=ch
  }
  out.push(cur.trim())
  return out
}

function parseCsv(text:string): WorkoutTemplate[] {
  const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/).filter(x=>x.trim())
  if(lines.length<2) throw new Error('O CSV precisa ter cabeçalho e pelo menos um exercício.')
  const delimiter=(lines[0].match(/;/g)||[]).length>(lines[0].match(/,/g)||[]).length?';':','
  const headers=splitCsvLine(lines[0],delimiter).map(key)
  const rows=lines.slice(1).map(line=>{
    const values=splitCsvLine(line,delimiter)
    return Object.fromEntries(headers.map((h,i)=>[h,values[i]??'']))
  })
  const groups=new Map<string, Record<string,unknown>[]>()
  rows.forEach(r=>{
    const title=clean(r.treino ?? r.workout ?? r.plano) || 'Treino importado'
    if(!groups.has(title)) groups.set(title,[])
    groups.get(title)!.push(r)
  })
  let idx=0
  return [...groups.entries()].map(([title, rows])=>{
    const prefix=`custom-${Date.now()}-${idx++}`
    return {
      id:prefix,
      title,
      focus:clean(rows[0].foco ?? rows[0].focus) || 'Treino importado',
      source:'imported' as const,
      importedAt:new Date().toISOString(),
      exercises:rows.map((r,i)=>normalizeExercise(r,i,prefix))
    }
  }).filter(w=>w.exercises.length)
}

export async function parseWorkoutFile(file: File): Promise<WorkoutTemplate[]> {
  const text=await file.text()
  const lower=file.name.toLowerCase()
  if(lower.endsWith('.json') || file.type.includes('json')){
    const parsed=JSON.parse(text)
    const list=Array.isArray(parsed)?parsed:[parsed]
    const workouts=list.map((x,i)=>normalizeWorkout((x||{}) as Record<string,unknown>,i)).filter(w=>w.exercises.length)
    if(!workouts.length) throw new Error('Nenhum exercício válido foi encontrado no JSON.')
    return workouts
  }
  if(lower.endsWith('.csv') || file.type.includes('csv') || file.type.includes('text')) return parseCsv(text)
  throw new Error('Formato não suportado. Use CSV ou JSON.')
}
