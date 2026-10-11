import type { NutritionFood, NutritionMeal, NutritionPlan } from './types'

const clean=(v:unknown)=>String(v??'').trim()
const num=(v:unknown, fallback=0)=>{
  const n=Number(String(v??'').replace(',','.'))
  return Number.isFinite(n)?n:fallback
}
const slug=(s:string)=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
const uid=(prefix:string)=>`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`

function splitCsvLine(line:string, delimiter:string){
  const out:string[]=[]; let cur=''; let quoted=false
  for(let i=0;i<line.length;i++){
    const ch=line[i]
    if(ch==='"'){
      if(quoted && line[i+1]==='"'){cur+='"';i++}
      else quoted=!quoted
    }else if(ch===delimiter && !quoted){out.push(cur.trim());cur=''}
    else cur+=ch
  }
  out.push(cur.trim())
  return out
}
const key=(s:string)=>slug(s).replace(/-/g,'_')

function foodFromRow(r:Record<string,unknown>, index:number):NutritionFood{
  const name=clean(r.alimento ?? r.food ?? r.item ?? r.nome) || `Alimento ${index+1}`
  return {
    id:uid('food'),
    name,
    amount:num(r.quantidade ?? r.amount,0)||undefined,
    unit:clean(r.unidade ?? r.unit) || undefined,
    calories:num(r.calorias ?? r.kcal ?? r.calories,0)||undefined,
    protein:num(r.proteina ?? r.protein,0)||undefined,
    carbs:num(r.carboidrato ?? r.carbo ?? r.carbs,0)||undefined,
    fat:num(r.gordura ?? r.fat,0)||undefined,
    notes:clean(r.observacoes ?? r.notes) || undefined
  }
}

function mealTotals(foods:NutritionFood[]){
  return foods.reduce((a,f)=>({
    calories:a.calories+(f.calories||0),
    protein:a.protein+(f.protein||0),
    carbs:a.carbs+(f.carbs||0),
    fat:a.fat+(f.fat||0)
  }),{calories:0,protein:0,carbs:0,fat:0})
}

function makeMeal(name:string,time:string|undefined,foods:NutritionFood[]):NutritionMeal{
  const t=mealTotals(foods)
  return {id:uid('meal'),name,time,foods,...t}
}

function finalize(title:string, meals:NutritionMeal[], explicit?:Partial<NutritionPlan>):NutritionPlan{
  const sums=meals.reduce((a,m)=>({
    calories:a.calories+m.calories, protein:a.protein+m.protein, carbs:a.carbs+m.carbs, fat:a.fat+m.fat
  }),{calories:0,protein:0,carbs:0,fat:0})
  return {
    id:uid('diet'),
    title:title||'Plano alimentar',
    calories:num(explicit?.calories,sums.calories),
    protein:num(explicit?.protein,sums.protein),
    carbs:num(explicit?.carbs,sums.carbs),
    fat:num(explicit?.fat,sums.fat),
    meals,
    importedAt:new Date().toISOString()
  }
}

function parseCsv(text:string):NutritionPlan{
  const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/).filter(x=>x.trim())
  if(lines.length<2) throw new Error('O CSV precisa ter cabeçalho e pelo menos um alimento.')
  const delimiter=(lines[0].match(/;/g)||[]).length>(lines[0].match(/,/g)||[]).length?';':','
  const headers=splitCsvLine(lines[0],delimiter).map(key)
  const rows=lines.slice(1).map(line=>{
    const values=splitCsvLine(line,delimiter)
    return Object.fromEntries(headers.map((h,i)=>[h,values[i]??'']))
  })
  const groups=new Map<string,{time?:string,foods:NutritionFood[]}>()
  rows.forEach((r,i)=>{
    const meal=clean(r.refeicao ?? r.meal ?? r.momento) || 'Refeição'
    const time=clean(r.horario ?? r.time) || undefined
    if(!groups.has(meal)) groups.set(meal,{time,foods:[]})
    groups.get(meal)!.foods.push(foodFromRow(r,i))
  })
  const meals=[...groups.entries()].map(([name,v])=>makeMeal(name,v.time,v.foods))
  if(!meals.length) throw new Error('Nenhuma refeição válida foi encontrada.')
  return finalize(clean(rows[0]?.plano ?? rows[0]?.diet ?? rows[0]?.titulo) || 'Plano alimentar importado',meals)
}

function parseJson(text:string):NutritionPlan{
  const raw=JSON.parse(text)
  const root=Array.isArray(raw)?{title:'Plano alimentar',meals:raw}:raw
  const mealsRaw=Array.isArray(root.meals)?root.meals:Array.isArray(root.refeicoes)?root.refeicoes:[]
  const meals: NutritionMeal[] = mealsRaw.map((m:Record<string,unknown>,mi:number)=>{
    const foodsRaw=Array.isArray(m.foods)?m.foods:Array.isArray(m.alimentos)?m.alimentos:[]
    const foods=foodsRaw.map((f:Record<string,unknown>,fi:number)=>foodFromRow(f,mi*100+fi))
    const meal=makeMeal(clean(m.name ?? m.nome ?? m.refeicao)||`Refeição ${mi+1}`,clean(m.time ?? m.horario)||undefined,foods)
    return {
      ...meal,
      calories:num(m.calories ?? m.calorias,meal.calories),
      protein:num(m.protein ?? m.proteina,meal.protein),
      carbs:num(m.carbs ?? m.carboidrato,meal.carbs),
      fat:num(m.fat ?? m.gordura,meal.fat)
    }
  })
  if(!meals.length) throw new Error('Nenhuma refeição válida foi encontrada no JSON.')
  return finalize(clean(root.title ?? root.titulo ?? root.name) || 'Plano alimentar importado',meals,{
    calories:num(root.calories ?? root.calorias,0)||undefined,
    protein:num(root.protein ?? root.proteina,0)||undefined,
    carbs:num(root.carbs ?? root.carboidrato,0)||undefined,
    fat:num(root.fat ?? root.gordura,0)||undefined
  })
}

export async function parseDietFile(file:File):Promise<NutritionPlan>{
  const text=await file.text()
  const lower=file.name.toLowerCase()
  if(lower.endsWith('.json')||file.type.includes('json')) return parseJson(text)
  if(lower.endsWith('.csv')||file.type.includes('csv')||file.type.includes('text')) return parseCsv(text)
  throw new Error('Formato não suportado. Use CSV ou JSON.')
}
