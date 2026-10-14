"use client";
import {useEffect,useState} from "react";
type DealerUser={id:string;email:string;display_name:string;is_active:boolean;tenant_name:string};
type Vehicle={id:string;title:string;year:number;price_cents:string;status:"draft"|"published"|"archived";tenant_name:string};
const format=(value:string)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(Number(value)/100);
export default function MasterControlSections(){
 const [tenants,setTenants]=useState<{id:string;name:string;status:string}[]>([]),[newUser,setNewUser]=useState({tenantId:"",displayName:"",email:"",password:""}),[creating,setCreating]=useState(false),[users,setUsers]=useState<DealerUser[]>([]),[vehicles,setVehicles]=useState<Vehicle[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[notice,setNotice]=useState(""),[pending,setPending]=useState("");
 async function load(){setLoading(true);try{
 const [ur,vr,tr]=await Promise.all([fetch("/api/master/users",{cache:"no-store"}),fetch("/api/master/vehicles",{cache:"no-store"}),fetch("/api/master/overview",{cache:"no-store"})]);
 if(!ur.ok||!vr.ok||!tr.ok)throw Error("Não foi possível carregar os controles");
 const [u,v,t]=await Promise.all([ur.json(),vr.json(),tr.json()]);
 setTenants(t.latestTenants||[]);
 setUsers(u.items||[]);setVehicles(v.items||[]);
 }catch(e){setError(e instanceof Error?e.message:"Erro ao consultar dados")}finally{setLoading(false)}}
 useEffect(()=>{void load()},[]);
 async function change(path:string,data:Record<string,unknown>,success:string){setError("");setNotice("");setPending(path);
 try{const r=await fetch(path,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});const json=await r.json();if(!r.ok)throw Error(json.error||"Alteração não realizada");setNotice(success);await load()}catch(e){setError(e instanceof Error?e.message:"Falha na alteração")}finally{setPending("")}}
 async function createUser(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setCreating(true);setError("");setNotice("");
 try{const r=await fetch("/api/master/users",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(newUser)});
 const d=await r.json();if(!r.ok)throw Error(d.error||"Não foi possível criar usuário");
 setNewUser({tenantId:"",displayName:"",email:"",password:""});setNotice("Usuário criado. O acesso poderá ser feito no painel da revenda.");await load()}
 catch(e){setError(e instanceof Error?e.message:"Falha no cadastro")}finally{setCreating(false)}}
 return <div className="master-control-sections"><div className="dw-top"><div><p className="overline">GESTÃO CENTRALIZADA</p><h2>Usuários e anúncios</h2><p>Controle de acesso dos colaboradores e moderação de anúncios de todas as revendas.</p></div><button className="dw-logout" onClick={()=>void load()} disabled={loading}>Atualizar dados ↻</button></div>
 {loading&&<div className="real-status">Buscando usuários e anúncios...</div>}
 {error&&<div className="dw-message dw-error" role="alert">{error}</div>}
 {notice&&<div className="dw-message" role="status">{notice}</div>}
 <section className="dashboard-panel master-create-user"><p className="overline">NOVO ACESSO DE REVENDA</p><h2>Cadastrar funcionário</h2><p>Crie uma conta vinculada a uma revenda ativa. A senha é protegida no banco.</p><form className="dw-form" onSubmit={createUser}>
<label>Revenda<select required value={newUser.tenantId} onChange={e=>setNewUser(x=>({...x,tenantId:e.target.value}))}><option value="">Selecione a revenda</option>{tenants.filter(t=>t.status==="active").map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
<label>Nome do funcionário<input required minLength={2} maxLength={120} value={newUser.displayName} onChange={e=>setNewUser(x=>({...x,displayName:e.target.value}))}/></label>
<label>E-mail<input required type="email" autoComplete="off" value={newUser.email} onChange={e=>setNewUser(x=>({...x,email:e.target.value}))}/></label>
<label>Senha inicial (mínimo 12 caracteres)<input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={newUser.password} onChange={e=>setNewUser(x=>({...x,password:e.target.value}))}/></label>
<button className="premium-red-btn" type="submit" disabled={creating||!tenants.some(t=>t.status==="active")}>{creating?"CRIANDO...":"CADASTRAR USUÁRIO ↗"}</button></form><p style={{fontSize:12,color:"#6b7280"}}>Compartilhe as credenciais com o funcionário por um meio privado e seguro. Não use sua senha Master.</p></section><div className="dw-columns">
 <section className="dashboard-panel"><p className="overline">ADMINISTRAÇÃO MASTER</p><h2>Usuários das revendas</h2><p>Ao desativar um usuário, as sessões ativas dele são encerradas.</p>
 {!loading&&users.length===0&&<div className="dw-empty">Nenhum usuário de revenda cadastrado.</div>}
 <div className="dw-items">{users.map(u=><article className="dw-item" key={u.id}><span className={"dw-status "+(u.is_active?"published":"archived")}>{u.is_active?"Ativo":"Desativado"}</span><h3>{u.display_name}</h3><p>{u.email} · {u.tenant_name}</p><div className="dw-item-actions"><button disabled={pending!==""} onClick={()=>void change("/api/master/users/"+u.id,{isActive:!u.is_active},u.is_active?"Acesso desativado e sessões revogadas.":"Usuário reativado.")}>{pending==="/api/master/users/"+u.id?"Salvando...":u.is_active?"Desativar acesso":"Reativar acesso"}</button></div></article>)}</div>
 </section><section className="dashboard-panel"><p className="overline">MODERAÇÃO MASTER</p><h2>Todos os anúncios</h2><p>A publicação fica visível no marketplace apenas se a revenda estiver ativa.</p>
 {!loading&&vehicles.length===0&&<div className="dw-empty">Nenhum veículo cadastrado.</div>}
 <div className="dw-items">{vehicles.map(v=><article className="dw-item" key={v.id}><span className={"dw-status "+v.status}>{v.status==="published"?"Publicado":v.status==="draft"?"Rascunho":"Arquivado"}</span><h3>{v.title}</h3><p>{v.tenant_name} · {v.year}</p><strong>{format(v.price_cents)}</strong><div className="dw-item-actions">{(["draft","published","archived"] as const).filter(s=>s!==v.status).map(s=><button key={s} disabled={pending!==""} onClick={()=>void change("/api/master/vehicles/"+v.id,{status:s},"Situação do anúncio atualizada.")}>{s==="draft"?"Colocar em rascunho":s==="published"?"Publicar":"Arquivar"}</button>)}</div></article>)}</div>
 </section></div></div>
}
