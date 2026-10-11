import { useState } from 'react'
import { nutritionTarget } from './data'
import { parseDietFile } from './dietImport'
import type { HealthSection, Measurement, NutritionPlan, TrekkingLog, WorkoutSession } from './types'

const todayISO=()=>new Date().toISOString().slice(0,10)
const uid=()=>crypto.randomUUID?crypto.randomUUID():String(Date.now())
const fmtMin=(m:number)=>`${Math.floor(m/60)}h ${m%60}min`

export default function HealthHub({measurements,sessions,treks,nutritionPlan,onSaveNutritionPlan,onSaveMeasurement,onSaveTrek}:{measurements:Measurement[],sessions:WorkoutSession[],treks:TrekkingLog[],nutritionPlan:NutritionPlan|null,onSaveNutritionPlan:(p:NutritionPlan|null)=>void,onSaveMeasurement:(m:Measurement)=>void,onSaveTrek:(t:TrekkingLog)=>void}){
 const [section,setSection]=useState<HealthSection>('summary')
 const latest=measurements.slice().sort((a,b)=>b.date.localeCompare(a.date))[0]
 const totalTreks=treks.reduce((a,t)=>a+t.distanceKm,0)
 return <div className="page health-shell">
   <div className="screen-title"><div><p className="eyebrow">SAÚDE & PERFORMANCE</p><h1>Saúde</h1></div><button className="round-btn">•••</button></div>
   <div className="subtabs">
    <button className={section==='summary'?'active':''} onClick={()=>setSection('summary')}>Resumo</button>
    <button className={section==='body'?'active':''} onClick={()=>setSection('body')}>Body</button>
    <button className={section==='nutrition'?'active':''} onClick={()=>setSection('nutrition')}>Nutri</button>
    <button className={section==='trekking'?'active':''} onClick={()=>setSection('trekking')}>Trekking</button>
   </div>
   {section==='summary'&&<>
    <section className="health-banner"><div><p className="eyebrow">MEDIR · ENTENDER · AGIR</p><h2>Seu painel de evolução</h2><p>Corpo, alimentação, treino e resistência no mesmo lugar.</p></div><span>↗</span></section>
    <h2 className="section-title">Desempenho</h2>
    <section className="metric-grid">
      <Metric label="Treinos" value={String(sessions.filter(s=>s.finishedAt).length)} sub="concluídos"/>
      <Metric label="Peso" value={latest?latest.weightKg+' kg':'—'} sub="último registro"/>
      <Metric label="Trekking" value={totalTreks.toFixed(1)+' km'} sub="acumulado"/>
      <Metric label="Medidas" value={String(measurements.length)} sub="check-ins"/>
    </section>
    <section className="card action-card"><div><p className="eyebrow">EVOLUÇÃO CORPORAL</p><h2>Transforme registros em tendência</h2><p>Use peso, cintura e performance em conjunto. Um único número não define progresso.</p></div><button className="ghost" onClick={()=>setSection('body')}>Ver detalhes</button></section>
    <section className="card action-card"><div><p className="eyebrow">PLANO NUTRICIONAL</p><h2>{nutritionPlan?.calories||nutritionTarget.calories} kcal/dia</h2><p>{nutritionPlan?nutritionPlan.title:`${nutritionTarget.protein}g proteína · ${nutritionTarget.carbs}g carbo · ${nutritionTarget.fat}g gordura`}</p></div><button className="ghost" onClick={()=>setSection('nutrition')}>Abrir Nutri</button></section>
   </>}
   {section==='body'&&<BodyView measurements={measurements} sessions={sessions} onSave={onSaveMeasurement}/>}
   {section==='nutrition'&&<NutritionView plan={nutritionPlan} onSave={onSaveNutritionPlan}/>}
   {section==='trekking'&&<TrekkingView treks={treks} onSave={onSaveTrek}/>}
 </div>
}

function Metric({label,value,sub}:{label:string,value:string,sub:string}){return <div className="metric"><small>{label}</small><b>{value}</b><span>{sub}</span></div>}

function BodyView({measurements,sessions,onSave}:{measurements:Measurement[],sessions:WorkoutSession[],onSave:(m:Measurement)=>void}){
 const [f,setF]=useState({weightKg:'',waistCm:'',hipCm:'',thighCm:''})
 const save=()=>{
   if(!f.weightKg)return alert('Informe o peso.')
   onSave({id:uid(),date:todayISO(),weightKg:+f.weightKg,waistCm:f.waistCm?+f.waistCm:undefined,hipCm:f.hipCm?+f.hipCm:undefined,thighCm:f.thighCm?+f.thighCm:undefined})
   setF({weightKg:'',waistCm:'',hipCm:'',thighCm:''})
 }
 const completedSets=sessions.reduce((a,s)=>a+s.exerciseLogs.reduce((x,l)=>x+l.sets.filter(z=>z.done).length,0),0)
 const sorted=measurements.slice().sort((a,b)=>b.date.localeCompare(a.date))
 const latest=sorted[0], previous=sorted[1]
 const delta=latest&&previous?latest.weightKg-previous.weightKg:null
 return <div className="embedded-page">
   <section className="body-hero card"><p className="eyebrow">COMPOSIÇÃO CORPORAL</p><div className="body-main"><div><small>Peso atual</small><b>{latest?latest.weightKg+' kg':'—'}</b></div><span className={delta!=null&&delta<=0?'trend good':'trend'}>{delta==null?'Sem tendência':(delta>0?'+':'')+delta.toFixed(1)+' kg'}</span></div><div className="body-scale"><span>Abaixo</span><span>Faixa pessoal</span><span>Acima</span></div><div className="scale-line"><i/></div></section>
   <section className="metric-grid"><Metric label="Sessões" value={String(sessions.filter(s=>s.finishedAt).length)} sub="concluídas"/><Metric label="Séries" value={String(completedSets)} sub="registradas"/><Metric label="Cintura" value={latest?.waistCm?latest.waistCm+' cm':'—'} sub="última medida"/><Metric label="Check-ins" value={String(measurements.length)} sub="corporais"/></section>
   <section className="card form-grid"><Field label="Peso (kg)" value={f.weightKg} set={v=>setF({...f,weightKg:v})}/><Field label="Cintura (cm)" value={f.waistCm} set={v=>setF({...f,waistCm:v})}/><Field label="Quadril (cm)" value={f.hipCm} set={v=>setF({...f,hipCm:v})}/><Field label="Coxa (cm)" value={f.thighCm} set={v=>setF({...f,thighCm:v})}/><button className="primary full" onClick={save}>Salvar medidas</button></section>
   <section className="card"><h2>Histórico corporal</h2>{sorted.length===0?<p>Nenhum registro ainda.</p>:sorted.map(m=><div className="history-item" key={m.id}><div><b>{m.weightKg} kg</b><small>{m.date}</small></div><div className="right"><small>Cintura {m.waistCm??'—'} cm</small><small>Quadril {m.hipCm??'—'} cm</small></div></div>)}</section>
 </div>
}

function NutritionView({plan,onSave}:{plan:NutritionPlan|null,onSave:(p:NutritionPlan|null)=>void}){
 const [importing,setImporting]=useState(false)
 const [openMeal,setOpenMeal]=useState<string|null>(plan?.meals[0]?.id||null)
 const handleFile=async(file?:File)=>{
   if(!file)return
   setImporting(true)
   try{
     const parsed=await parseDietFile(file)
     onSave(parsed)
     setOpenMeal(parsed.meals[0]?.id||null)
     alert('Dieta importada e salva no TrekFit.')
   }catch(err){
     alert(err instanceof Error?err.message:'Não foi possível importar esta dieta.')
   }finally{setImporting(false)}
 }
 const calories=plan?.calories||nutritionTarget.calories
 const protein=plan?.protein||nutritionTarget.protein
 const carbs=plan?.carbs||nutritionTarget.carbs
 const fat=plan?.fat||nutritionTarget.fat
 return <div className="embedded-page">
   <section className="nutrition-summary"><p className="eyebrow">{plan?'PLANO IMPORTADO':'META ATUAL'}</p><h1>{calories} kcal</h1>{plan&&<h3 className="diet-title">{plan.title}</h3>}<div className="macro-row"><Macro label="Proteína" value={protein}/><Macro label="Carbo" value={carbs}/><Macro label="Gordura" value={fat}/></div></section>
   <section className="notice"><span>✦</span><div><b>Dieta guiada pelo acompanhamento</b><p>O plano pode ser atualizado conforme peso, medidas, performance, fome e aderência.</p></div></section>

   <section className="card import-card">
     <div><p className="eyebrow">IMPORTAR DIETA</p><h2>{plan?'Atualizar plano alimentar':'Adicionar plano alimentar'}</h2><p>Envie CSV ou JSON. As refeições e alimentos ficam salvos neste aparelho e aparecem diretamente na aba Nutri.</p></div>
     <label className={importing?'upload-btn disabled':'upload-btn'}>
       <input type="file" accept=".csv,.json,text/csv,application/json" disabled={importing} onChange={e=>{handleFile(e.target.files?.[0]);e.currentTarget.value=''}}/>
       <span>{importing?'Importando...':'↑ Escolher arquivo da dieta'}</span>
     </label>
     <div className="import-help"><b>CSV simples:</b> refeicao, horario, alimento, quantidade, unidade, calorias, proteina, carboidrato, gordura.</div>
     {plan&&<button className="text-danger" onClick={()=>confirm('Remover a dieta salva?')&&onSave(null)}>Remover dieta atual</button>}
   </section>

   {plan ? <>
     <div className="meal-heading"><h2 className="section-title">Refeições</h2><span>{plan.meals.length} no plano</span></div>
     <section className="meal-list detailed">{plan.meals.map(meal=>{
       const open=openMeal===meal.id
       return <div className={open?'meal-card detailed open':'meal-card detailed'} key={meal.id}>
         <button className="meal-summary" onClick={()=>setOpenMeal(open?null:meal.id)}>
           <div><small>{meal.time||'Horário livre'}</small><h3>{meal.name}</h3><p>{Math.round(meal.calories)} kcal · P {Math.round(meal.protein)}g · C {Math.round(meal.carbs)}g · G {Math.round(meal.fat)}g</p></div><span>{open?'⌃':'⌄'}</span>
         </button>
         {open&&<div className="food-list">{meal.foods.map(food=><div className="food-row" key={food.id}>
           <div><b>{food.name}</b><small>{food.amount?food.amount:''} {food.unit||''}{food.notes?` · ${food.notes}`:''}</small></div>
           <div className="food-macros"><b>{food.calories!=null?`${Math.round(food.calories)} kcal`:'—'}</b><small>{food.protein!=null?`P ${food.protein}g`:''}{food.carbs!=null?` · C ${food.carbs}g`:''}{food.fat!=null?` · G ${food.fat}g`:''}</small></div>
         </div>)}</div>}
       </div>
     })}</section>
   </> : <section className="info-note">Ainda não há uma dieta importada. A meta acima continua como referência até você enviar um plano alimentar.</section>}
 </div>
}

function Macro({label,value}:{label:string,value:number}){return <div className="macro"><span className="macro-circle">{value}</span><small>{label}</small><b>g</b></div>}

function TrekkingView({treks,onSave}:{treks:TrekkingLog[],onSave:(t:TrekkingLog)=>void}){
 const [form,setForm]=useState({distanceKm:'',durationMin:'',elevationM:'',backpackKg:'',lumbarPain:'0',kneePain:'0',effort:'5'})
 const save=()=>{
  if(!form.distanceKm||!form.durationMin)return alert('Preencha distância e duração.')
  onSave({id:uid(),date:todayISO(),distanceKm:+form.distanceKm,durationMin:+form.durationMin,elevationM:+form.elevationM||0,backpackKg:+form.backpackKg||0,lumbarPain:+form.lumbarPain,kneePain:+form.kneePain,effort:+form.effort})
  setForm({distanceKm:'',durationMin:'',elevationM:'',backpackKg:'',lumbarPain:'0',kneePain:'0',effort:'5'})
 }
 return <div className="embedded-page"><section className="card"><p className="eyebrow">TREKKING</p><h2>Treino outdoor</h2><p>Registre distância, tempo, desnível e mochila para acompanhar a transferência da academia para a trilha.</p></section><section className="card form-grid">
   <Field label="Distância (km)" value={form.distanceKm} set={v=>setForm({...form,distanceKm:v})}/><Field label="Duração (min)" value={form.durationMin} set={v=>setForm({...form,durationMin:v})}/><Field label="Elevação (m)" value={form.elevationM} set={v=>setForm({...form,elevationM:v})}/><Field label="Mochila (kg)" value={form.backpackKg} set={v=>setForm({...form,backpackKg:v})}/><Field label="Dor lombar 0–10" value={form.lumbarPain} set={v=>setForm({...form,lumbarPain:v})}/><Field label="Dor joelho 0–10" value={form.kneePain} set={v=>setForm({...form,kneePain:v})}/><Field label="Esforço 0–10" value={form.effort} set={v=>setForm({...form,effort:v})}/><button className="primary full" onClick={save}>Salvar trekking</button>
 </section><section className="card"><h2>Histórico</h2>{treks.length===0?<p>Nenhuma sessão registrada.</p>:treks.map(t=><div className="history-item" key={t.id}><div><b>{t.distanceKm} km</b><small>{t.date} · {fmtMin(t.durationMin)}</small></div><div className="right"><b>+{t.elevationM} m</b><small>Mochila {t.backpackKg} kg</small></div></div>)}</section></div>
}

function Field({label,value,set}:{label:string,value:string,set:(v:string)=>void}){return <label className="field"><span>{label}</span><input inputMode="decimal" value={value} onChange={e=>set(e.target.value)}/></label>}
