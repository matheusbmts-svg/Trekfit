import { useState } from 'react'
import type { CoachCheckin } from './types'

const todayISO=()=>new Date().toISOString().slice(0,10)
const uid=()=>crypto.randomUUID?crypto.randomUUID():String(Date.now())

export default function CoachView({checkins,onSave}:{checkins:CoachCheckin[],onSave:(c:CoachCheckin)=>void}){
 const [f,setF]=useState({sleepHours:'7',energy:'7',hunger:'5',stress:'5',recovery:'7',pain:'0',adherence:'90',notes:''})
 const latest=checkins[0]
 const makeSummary=()=>`Check-in TrekFit — ${todayISO()}
Sono: ${f.sleepHours} h
Energia: ${f.energy}/10
Fome: ${f.hunger}/10
Estresse: ${f.stress}/10
Recuperação: ${f.recovery}/10
Dor: ${f.pain}/10
Aderência: ${f.adherence}%
Observações: ${f.notes||'Sem observações'}

Analise meu progresso e indique os ajustes necessários no treino e na alimentação.`
 const save=()=>{
   const v:CoachCheckin={id:uid(),date:todayISO(),sleepHours:+f.sleepHours,energy:+f.energy,hunger:+f.hunger,stress:+f.stress,recovery:+f.recovery,pain:+f.pain,adherence:+f.adherence,notes:f.notes}
   onSave(v)
   alert('Check-in salvo. Agora você pode enviar o resumo para o coach.')
 }
 const copy=async()=>{
   try{
     await navigator.clipboard.writeText(makeSummary())
     alert('Resumo copiado. Cole na conversa com seu coach no ChatGPT.')
   }catch{
     alert('Não foi possível copiar automaticamente. Tente novamente no navegador.')
   }
 }
 return <div className="page">
   <section className="coach-hero"><button className="coach-orb big">✦</button><div><p className="eyebrow">PERSONAL TREKFIT</p><h1>Coach</h1><p>Check-ins objetivos para transformar sua rotina em ajustes de treino e nutrição.</p></div></section>
   {latest&&<section className="card coach-last"><p className="eyebrow">ÚLTIMO CHECK-IN · {latest.date}</p><div className="score-row"><span>Energia <b>{latest.energy}/10</b></span><span>Recuperação <b>{latest.recovery}/10</b></span><span>Aderência <b>{latest.adherence}%</b></span></div></section>}
   <section className="card"><h2>Check-in</h2><div className="form-grid"><Field label="Sono (h)" value={f.sleepHours} set={v=>setF({...f,sleepHours:v})}/><Field label="Energia 0–10" value={f.energy} set={v=>setF({...f,energy:v})}/><Field label="Fome 0–10" value={f.hunger} set={v=>setF({...f,hunger:v})}/><Field label="Estresse 0–10" value={f.stress} set={v=>setF({...f,stress:v})}/><Field label="Recuperação 0–10" value={f.recovery} set={v=>setF({...f,recovery:v})}/><Field label="Dor 0–10" value={f.pain} set={v=>setF({...f,pain:v})}/><Field label="Aderência (%)" value={f.adherence} set={v=>setF({...f,adherence:v})}/><label className="field full"><span>Observações</span><textarea value={f.notes} onChange={e=>setF({...f,notes:e.target.value})} placeholder="Sono ruim, treino pesado, fome maior, dor, viagem..."/></label></div><button className="primary" onClick={save}>Salvar check-in</button></section>
   <section className="card coach-contact"><div><p className="eyebrow">AJUSTE COM O COACH</p><h2>Leve seus dados para a conversa</h2><p>O resumo é preparado para análise de treino, recuperação e alimentação com contexto.</p></div><button className="primary" onClick={copy}>Copiar resumo para o coach</button><a className="secondary-link" href="https://chatgpt.com/" target="_blank" rel="noreferrer">Abrir ChatGPT ↗</a></section>
   <div className="info-note">O chat embutido no TrekFit exigirá uma integração segura com backend/API. Até essa etapa, seus dados ficam no aparelho e você decide quando compartilhá-los.</div>
 </div>
}

function Field({label,value,set}:{label:string,value:string,set:(v:string)=>void}){return <label className="field"><span>{label}</span><input inputMode="decimal" value={value} onChange={e=>set(e.target.value)}/></label>}
