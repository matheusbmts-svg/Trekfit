import { useMemo, useState } from 'react'
import { workouts, nutritionTarget } from './data'
import { storage } from './storage'
import type { ExerciseLog, Measurement, SetLog, Tab, TrekkingLog, WorkoutSession } from './types'

const todayISO = () => new Date().toISOString().slice(0,10)
const uid = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
const fmtMin = (m:number) => `${Math.floor(m/60)}h ${m%60}min`

function emptyLogs(templateId:string): ExerciseLog[] {
  const w = workouts.find(x=>x.id===templateId)!
  return w.exercises.map(e=>({
    exerciseId:e.id,
    exerciseName:e.name,
    sets:Array.from({length:e.sets},()=>({load:null,reps:null,rir:null,pain:null,done:false}))
  }))
}

function latestExerciseHistory(sessions:WorkoutSession[], exerciseId:string) {
  return sessions
    .filter(s=>Boolean(s.finishedAt))
    .flatMap(s=>s.exerciseLogs.map(l=>({date:s.date, log:l})))
    .filter(x=>x.log.exerciseId===exerciseId)
    .sort((a,b)=>b.date.localeCompare(a.date))[0]?.log
}

function nextLoadSuggestion(log:ExerciseLog, repMax:number) {
  const done = log.sets.filter(s=>s.done && s.load!=null && s.reps!=null)
  if (!done.length) return null
  const avgLoad = done.reduce((a,s)=>a+(s.load||0),0)/done.length
  const allAtMax = done.every(s=>(s.reps||0)>=repMax)
  const avgRir = done.filter(s=>s.rir!=null).reduce((a,s)=>a+(s.rir||0),0)/Math.max(1,done.filter(s=>s.rir!=null).length)
  const maxPain = Math.max(...done.map(s=>s.pain||0))
  if (allAtMax && avgRir>=2 && maxPain<=2) return {load:Math.round(avgLoad*1.025*2)/2, reason:'Todas as séries atingiram o topo da faixa com margem adequada.'}
  if (maxPain>=4 || avgRir<1) return {load:Math.round(avgLoad*.95*2)/2, reason:'Redução conservadora por dor/esforço alto.'}
  return {load:Math.round(avgLoad*2)/2, reason:'Mantenha a carga até consolidar a faixa de repetições.'}
}

export default function App(){
  const [tab,setTab]=useState<Tab>('home')
  const [sessions,setSessions]=useState<WorkoutSession[]>(storage.getSessions())
  const [treks,setTreks]=useState<TrekkingLog[]>(storage.getTreks())
  const [measurements,setMeasurements]=useState<Measurement[]>(storage.getMeasurements())
  const [selectedWorkout,setSelectedWorkout]=useState('A')
  const [active,setActive]=useState<WorkoutSession|null>(null)
  const [pain,setPain]=useState(0)
  const [radiating,setRadiating]=useState(false)

  const persistSessions=(v:WorkoutSession[])=>{setSessions(v);storage.saveSessions(v)}
  const persistTreks=(v:TrekkingLog[])=>{setTreks(v);storage.saveTreks(v)}
  const persistMeasurements=(v:Measurement[])=>{setMeasurements(v);storage.saveMeasurements(v)}

  const finishedThisWeek = useMemo(()=>{
    const now=new Date(); const d=(now.getDay()+6)%7; const monday=new Date(now); monday.setDate(now.getDate()-d); monday.setHours(0,0,0,0)
    return sessions.filter(s=>s.finishedAt && new Date(s.date)>=monday).length
  },[sessions])

  const weeklyVolume = useMemo(()=>sessions.slice(0,10).reduce((acc,s)=>acc+s.exerciseLogs.reduce((a,l)=>a+l.sets.reduce((z,x)=>z+(x.done?(x.load||0)*(x.reps||0):0),0),0),0),[sessions])
  const latestWeight = measurements.slice().sort((a,b)=>b.date.localeCompare(a.date))[0]?.weightKg

  const startWorkout=()=>{
    if(radiating){ alert('Dor irradiada, dormência ou perda de força merece avaliação profissional antes de uma sessão pesada.'); return }
    if(pain>=5){ alert('Com dor lombar 5/10 ou maior, prefira recuperação/avaliação em vez de treino pesado de membros inferiores.'); }
    const w=workouts.find(x=>x.id===selectedWorkout)!
    setActive({id:uid(),templateId:w.id,title:`${w.title} — ${w.focus}`,date:todayISO(),startedAt:new Date().toISOString(),lumbarPainBefore:pain,radiatingPain:radiating,exerciseLogs:emptyLogs(w.id)})
    setTab('workout')
  }

  const updateSet=(exerciseId:string,index:number,patch:Partial<SetLog>)=>{
    if(!active)return
    setActive({...active,exerciseLogs:active.exerciseLogs.map(l=>l.exerciseId!==exerciseId?l:{...l,sets:l.sets.map((s,i)=>i===index?{...s,...patch}:s)})})
  }

  const finishWorkout=()=>{
    if(!active)return
    const done={...active,finishedAt:new Date().toISOString()}
    persistSessions([done,...sessions])
    setActive(null); setTab('home')
  }

  return <div className="app-shell">
    <header className="topbar">
      <div><span className="brand-mark">▲</span><strong>TrekFit</strong></div>
      <span className="status-pill">PWA</span>
    </header>

    <main>
      {tab==='home' && <Home sessions={sessions} treks={treks} finishedThisWeek={finishedThisWeek} weeklyVolume={weeklyVolume} latestWeight={latestWeight} selectedWorkout={selectedWorkout} setSelectedWorkout={setSelectedWorkout} pain={pain} setPain={setPain} radiating={radiating} setRadiating={setRadiating} startWorkout={startWorkout}/>} 
      {tab==='workout' && <WorkoutView active={active} sessions={sessions} selectedWorkout={selectedWorkout} setSelectedWorkout={setSelectedWorkout} startWorkout={startWorkout} updateSet={updateSet} finishWorkout={finishWorkout}/>} 
      {tab==='trekking' && <TrekkingView treks={treks} onSave={(t)=>persistTreks([t,...treks])}/>} 
      {tab==='progress' && <ProgressView measurements={measurements} sessions={sessions} onSave={(m)=>persistMeasurements([m,...measurements])}/>} 
      {tab==='nutrition' && <NutritionView/>}
    </main>

    <nav className="bottom-nav">
      <NavButton active={tab==='home'} label="Início" icon="⌂" onClick={()=>setTab('home')}/>
      <NavButton active={tab==='workout'} label="Treino" icon="●" onClick={()=>setTab('workout')}/>
      <NavButton active={tab==='trekking'} label="Trekking" icon="▲" onClick={()=>setTab('trekking')}/>
      <NavButton active={tab==='progress'} label="Progresso" icon="↗" onClick={()=>setTab('progress')}/>
      <NavButton active={tab==='nutrition'} label="Nutrição" icon="◐" onClick={()=>setTab('nutrition')}/>
    </nav>
  </div>
}

function NavButton({active,label,icon,onClick}:{active:boolean,label:string,icon:string,onClick:()=>void}){
 return <button className={active?'nav-btn active':'nav-btn'} onClick={onClick}><span>{icon}</span><small>{label}</small></button>
}

function Home({sessions,treks,finishedThisWeek,weeklyVolume,latestWeight,selectedWorkout,setSelectedWorkout,pain,setPain,radiating,setRadiating,startWorkout}:{sessions:WorkoutSession[],treks:TrekkingLog[],finishedThisWeek:number,weeklyVolume:number,latestWeight?:number,selectedWorkout:string,setSelectedWorkout:(v:string)=>void,pain:number,setPain:(v:number)=>void,radiating:boolean,setRadiating:(v:boolean)=>void,startWorkout:()=>void}){
 const w=workouts.find(x=>x.id===selectedWorkout)!
 const totalCardio=treks.slice(0,7).reduce((a,t)=>a+t.durationMin,0)
 return <div className="page">
   <section className="hero">
     <p className="eyebrow">PLANO 5X/SEMANA</p>
     <h1>Hipertrofia + trekking</h1>
     <p>Treino com foco em pernas, core, resistência e controle de carga para proteger a região lombar.</p>
   </section>

   <section className="metric-grid">
    <Metric label="Treinos" value={`${finishedThisWeek}/5`} sub="esta semana"/>
    <Metric label="Volume" value={`${Math.round(weeklyVolume/1000)}k`} sub="kg registrados"/>
    <Metric label="Cardio" value={`${totalCardio}`} sub="min recentes"/>
    <Metric label="Peso" value={latestWeight?`${latestWeight} kg`:'—'} sub="último registro"/>
   </section>

   <section className="card">
    <div className="section-head"><div><p className="eyebrow">TREINO DE HOJE</p><h2>{w.title}</h2></div><span className="tag">~75–90 min</span></div>
    <h3>{w.focus}</h3>
    <select value={selectedWorkout} onChange={e=>setSelectedWorkout(e.target.value)} className="select">
      {workouts.map(x=><option key={x.id} value={x.id}>{x.title} — {x.focus}</option>)}
    </select>
    <div className="safety-box">
      <strong>Check-in lombar</strong>
      <label>Dor agora: <b>{pain}/10</b></label>
      <input type="range" min="0" max="10" value={pain} onChange={e=>setPain(+e.target.value)}/>
      <label className="check"><input type="checkbox" checked={radiating} onChange={e=>setRadiating(e.target.checked)}/> Dor irradiando para glúteo/perna</label>
      <small>{pain<=2?'Treino normal, se técnica estiver estável.':pain<=4?'Reduza carga em 10–20% e priorize exercícios estáveis.':'Evite sessão pesada e considere avaliação profissional.'}</small>
    </div>
    <button className="primary" onClick={startWorkout}>Iniciar treino</button>
   </section>

   <section className="card compact"><p className="eyebrow">PRÓXIMA META DE TREKKING</p><h3>Base → resistência → especificidade</h3><p>Não aumente distância, inclinação e peso da mochila ao mesmo tempo. Progrida uma variável por vez.</p></section>
 </div>
}

function Metric({label,value,sub}:{label:string,value:string,sub:string}){return <div className="metric"><small>{label}</small><b>{value}</b><span>{sub}</span></div>}

function WorkoutView({active,sessions,selectedWorkout,setSelectedWorkout,startWorkout,updateSet,finishWorkout}:{active:WorkoutSession|null,sessions:WorkoutSession[],selectedWorkout:string,setSelectedWorkout:(v:string)=>void,startWorkout:()=>void,updateSet:(e:string,i:number,p:Partial<SetLog>)=>void,finishWorkout:()=>void}){
 if(!active){const w=workouts.find(x=>x.id===selectedWorkout)!;return <div className="page"><section className="card"><p className="eyebrow">FICHA DE TREINO</p><h1>{w.title}</h1><p>{w.focus}</p><select value={selectedWorkout} onChange={e=>setSelectedWorkout(e.target.value)} className="select">{workouts.map(x=><option key={x.id} value={x.id}>{x.title} — {x.focus}</option>)}</select><div className="exercise-preview">{w.exercises.map(e=><div key={e.id}><span>{e.name}</span><b>{e.sets}×{e.repMin}–{e.repMax}</b></div>)}</div><button className="primary" onClick={startWorkout}>Começar este treino</button></section></div>}
 const template=workouts.find(x=>x.id===active.templateId)!
 return <div className="page workout-page">
   <section className="card session-head"><p className="eyebrow">EM ANDAMENTO</p><h1>{template.title}</h1><p>{template.focus}</p><div className="pain-badge">Lombar pré-treino: {active.lumbarPainBefore}/10</div></section>
   {template.exercises.map(ex=>{
     const log=active.exerciseLogs.find(l=>l.exerciseId===ex.id)!
     const prev=latestExerciseHistory(sessions,ex.id)
     const suggestion=prev?nextLoadSuggestion(prev,ex.repMax):null
     return <section className="card exercise-card" key={ex.id}>
       <div className="section-head"><div><p className="eyebrow">{ex.muscle}</p><h2>{ex.name}</h2></div><span className={`risk ${ex.spineStress.toLowerCase()}`}>{ex.spineStress}</span></div>
       <p className="prescription">{ex.sets} séries · {ex.repMin}–{ex.repMax} reps · descanso {ex.rest}s</p>
       {ex.notes&&<div className="note">{ex.notes}</div>}
       {prev&&<div className="history-line">Último: {prev.sets.filter(s=>s.done).map(s=>`${s.load??'-'}kg×${s.reps??'-'}`).join(' · ')}</div>}
       {suggestion&&<div className="suggestion">Sugestão atual: <b>{suggestion.load} kg</b> — {suggestion.reason}</div>}
       <div className="set-table">
         <div className="set-row header"><span>Série</span><span>kg</span><span>reps</span><span>RIR</span><span>dor</span><span>✓</span></div>
         {log.sets.map((s,i)=><div className={s.done?'set-row done':'set-row'} key={i}>
           <b>{i+1}</b>
           <input inputMode="decimal" value={s.load??''} onChange={e=>updateSet(ex.id,i,{load:e.target.value===''?null:+e.target.value})}/>
           <input inputMode="numeric" value={s.reps??''} onChange={e=>updateSet(ex.id,i,{reps:e.target.value===''?null:+e.target.value})}/>
           <select value={s.rir??''} onChange={e=>updateSet(ex.id,i,{rir:e.target.value===''?null:+e.target.value})}><option value="">—</option>{[0,1,2,3,4].map(x=><option key={x}>{x}</option>)}</select>
           <select value={s.pain??''} onChange={e=>updateSet(ex.id,i,{pain:e.target.value===''?null:+e.target.value})}><option value="">—</option>{[0,1,2,3,4,5,6,7,8,9,10].map(x=><option key={x}>{x}</option>)}</select>
           <button className={s.done?'done-btn checked':'done-btn'} onClick={()=>updateSet(ex.id,i,{done:!s.done})}>{s.done?'✓':'○'}</button>
         </div>)}
       </div>
     </section>
   })}
   <section className="card"><p className="eyebrow">CARDIO</p><h3>{template.cardio}</h3><p>Interrompa ou reduza intensidade caso surjam sintomas neurológicos ou piora relevante da dor.</p></section>
   <button className="primary finish" onClick={finishWorkout}>Finalizar treino</button>
 </div>
}

function TrekkingView({treks,onSave}:{treks:TrekkingLog[],onSave:(t:TrekkingLog)=>void}){
 const [form,setForm]=useState({distanceKm:'',durationMin:'',elevationM:'',backpackKg:'',lumbarPain:'0',kneePain:'0',effort:'5'})
 const save=()=>{
  if(!form.distanceKm||!form.durationMin)return alert('Preencha distância e duração.')
  onSave({id:uid(),date:todayISO(),distanceKm:+form.distanceKm,durationMin:+form.durationMin,elevationM:+form.elevationM||0,backpackKg:+form.backpackKg||0,lumbarPain:+form.lumbarPain,kneePain:+form.kneePain,effort:+form.effort})
  setForm({distanceKm:'',durationMin:'',elevationM:'',backpackKg:'',lumbarPain:'0',kneePain:'0',effort:'5'})
 }
 return <div className="page"><section className="hero"><p className="eyebrow">TREKKING</p><h1>Treino outdoor</h1><p>Registre o que realmente importa para transferir a academia para a trilha.</p></section><section className="card form-grid">
   <Field label="Distância (km)" value={form.distanceKm} set={v=>setForm({...form,distanceKm:v})}/><Field label="Duração (min)" value={form.durationMin} set={v=>setForm({...form,durationMin:v})}/><Field label="Elevação (m)" value={form.elevationM} set={v=>setForm({...form,elevationM:v})}/><Field label="Mochila (kg)" value={form.backpackKg} set={v=>setForm({...form,backpackKg:v})}/><Field label="Dor lombar 0–10" value={form.lumbarPain} set={v=>setForm({...form,lumbarPain:v})}/><Field label="Dor joelho 0–10" value={form.kneePain} set={v=>setForm({...form,kneePain:v})}/><Field label="Esforço 0–10" value={form.effort} set={v=>setForm({...form,effort:v})}/><button className="primary full" onClick={save}>Salvar trekking</button>
 </section><section className="card"><h2>Histórico</h2>{treks.length===0?<p>Nenhuma sessão registrada.</p>:treks.map(t=><div className="history-item" key={t.id}><div><b>{t.distanceKm} km</b><small>{t.date} · {fmtMin(t.durationMin)}</small></div><div className="right"><b>+{t.elevationM} m</b><small>Mochila {t.backpackKg} kg</small></div></div>)}</section></div>
}

function ProgressView({measurements,sessions,onSave}:{measurements:Measurement[],sessions:WorkoutSession[],onSave:(m:Measurement)=>void}){
 const [f,setF]=useState({weightKg:'',waistCm:'',hipCm:'',thighCm:''})
 const save=()=>{if(!f.weightKg)return alert('Informe o peso.');onSave({id:uid(),date:todayISO(),weightKg:+f.weightKg,waistCm:f.waistCm?+f.waistCm:undefined,hipCm:f.hipCm?+f.hipCm:undefined,thighCm:f.thighCm?+f.thighCm:undefined});setF({weightKg:'',waistCm:'',hipCm:'',thighCm:''})}
 const completedSets=sessions.reduce((a,s)=>a+s.exerciseLogs.reduce((x,l)=>x+l.sets.filter(z=>z.done).length,0),0)
 return <div className="page"><section className="hero"><p className="eyebrow">PROGRESSO</p><h1>Evolução mensurável</h1><p>Peso isolado não decide o sucesso. Combine tendência corporal, performance e tolerância ao trekking.</p></section><section className="metric-grid"><Metric label="Sessões" value={`${sessions.filter(s=>s.finishedAt).length}`} sub="concluídas"/><Metric label="Séries" value={`${completedSets}`} sub="registradas"/><Metric label="Medidas" value={`${measurements.length}`} sub="check-ins"/><Metric label="Meta" value="5x" sub="por semana"/></section><section className="card form-grid"><Field label="Peso (kg)" value={f.weightKg} set={v=>setF({...f,weightKg:v})}/><Field label="Cintura (cm)" value={f.waistCm} set={v=>setF({...f,waistCm:v})}/><Field label="Quadril (cm)" value={f.hipCm} set={v=>setF({...f,hipCm:v})}/><Field label="Coxa (cm)" value={f.thighCm} set={v=>setF({...f,thighCm:v})}/><button className="primary full" onClick={save}>Salvar medidas</button></section><section className="card"><h2>Histórico corporal</h2>{measurements.length===0?<p>Nenhum registro ainda.</p>:measurements.map(m=><div className="history-item" key={m.id}><div><b>{m.weightKg} kg</b><small>{m.date}</small></div><div className="right"><small>Cintura {m.waistCm??'—'} cm</small><small>Quadril {m.hipCm??'—'} cm</small></div></div>)}</section></div>
}

function NutritionView(){return <div className="page"><section className="hero"><p className="eyebrow">NUTRIÇÃO</p><h1>Meta inicial</h1><p>Ponto de partida para recomposição e perda gradual de gordura. Ajuste pela tendência de 2–3 semanas, não por um único dia.</p></section><section className="macro-ring"><div><b>{nutritionTarget.calories}</b><span>kcal/dia</span></div></section><section className="metric-grid macro"><Metric label="Proteína" value={`${nutritionTarget.protein} g`} sub="prioridade"/><Metric label="Carbo" value={`${nutritionTarget.carbs} g`} sub="energia"/><Metric label="Gordura" value={`${nutritionTarget.fat} g`} sub="mínimo prático"/><Metric label="Ritmo" value="0,25–0,5" sub="kg/semana"/></section><section className="card"><h2>Regras simples</h2><ul className="rules"><li>Distribuir proteína em 3–5 refeições.</li><li>Antes do treino: 25–30 g de proteína + 30–60 g de carboidrato.</li><li>Hidratação e eletrólitos ganham importância em trekking prolongado.</li><li>Se peso/cintura não caírem por ~3 semanas, revisar ingestão e aderência antes de cortar agressivamente.</li></ul></section><section className="warning"><b>Importante</b><p>As metas são estimativas iniciais. Histórico clínico, medicações, exames, ciclo menstrual, preferências e rotina podem mudar a prescrição. Para terapia nutricional individual, procure nutricionista.</p></section></div>}

function Field({label,value,set}:{label:string,value:string,set:(v:string)=>void}){return <label className="field"><span>{label}</span><input inputMode="decimal" value={value} onChange={e=>set(e.target.value)} /></label>}
