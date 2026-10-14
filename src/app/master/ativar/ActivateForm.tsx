"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
export default function ActivateForm(){
 const router=useRouter();
 const [code,setCode]=useState(""),[password,setPassword]=useState(""),[confirm,setConfirm]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function submit(e:React.FormEvent<HTMLFormElement>){
 e.preventDefault();setError("");
 if(password!==confirm){setError("As senhas não coincidem");return}
 setBusy(true);
 try{
 const response=await fetch("/api/master/activate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"willsradd@gmail.com",code,password})});
 const data=await response.json();
 if(!response.ok)throw Error(data.error||"Não foi possível ativar");
 router.replace("/master");router.refresh();
 }catch(e){setError(e instanceof Error?e.message:"Falha na ativação")}finally{setBusy(false)}
 }
 return <form onSubmit={submit} className="dw-login" style={{maxWidth:540}}>
 <p className="overline">ATIVAÇÃO ÚNICA · ADMINISTRADOR MASTER</p>
 <h1>Ative seu acesso <em>VENZARO.</em></h1>
 <p>Somente o proprietário autorizado pode concluir esta primeira ativação. A senha é enviada diretamente ao servidor por HTTPS e não será exibida no chat.</p>
 <label>E-mail autorizado<input type="email" readOnly value="willsradd@gmail.com"/></label>
 <label>Código de ativação do Render<input type="password" required autoComplete="off" value={code} onChange={e=>setCode(e.target.value)} placeholder="Cole o valor da variável de ativação"/></label>
 <label>Nova senha Master (mínimo 12 caracteres)<input type="password" required minLength={12} maxLength={128} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>
 <label>Confirme a senha<input type="password" required minLength={12} maxLength={128} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>
 {error&&<p role="alert" className="dw-message dw-error">{error}</p>}
 <button className="premium-red-btn" type="submit" disabled={busy}>{busy?"ATIVANDO...":"ATIVAR MINHA CONTA MASTER ↗"}</button>
 <small>O código é temporário e só funciona antes da criação da primeira conta. Nunca compartilhe o código de ativação.</small>
 </form>
}
