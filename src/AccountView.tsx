import { useState } from 'react'
import type { Profile } from './types'

export default function AccountView({profile,onSave}:{profile:Profile,onSave:(p:Profile)=>void}){
 const [f,setF]=useState(profile)
 return <div className="page">
   <div className="screen-title"><div><p className="eyebrow">PERFIL</p><h1>Conta</h1></div><span className="avatar">{(f.name||'A').slice(0,1).toUpperCase()}</span></div>
   <section className="card profile-card"><h2>Seu perfil TrekFit</h2><label className="field"><span>Nome</span><input value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></label><label className="field"><span>Objetivo principal</span><input value={f.goal} onChange={e=>setF({...f,goal:e.target.value})}/></label><label className="field"><span>Meta de treinos por semana</span><input inputMode="numeric" value={f.weeklyTarget} onChange={e=>setF({...f,weeklyTarget:+e.target.value||0})}/></label><button className="primary" onClick={()=>{onSave(f);alert('Perfil salvo.')}}>Salvar perfil</button></section>
   <section className="card"><p className="eyebrow">DADOS</p><h2>Backup e sincronização</h2><p>Nesta versão, os registros continuam locais para preservar o funcionamento offline. Conta + Supabase será a próxima etapa de fundação.</p></section>
 </div>
}
