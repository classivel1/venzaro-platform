import Link from "next/link";
import {currentMaster} from "../../lib/master-auth";
import {MasterLogin,MasterDashboard} from "./MasterPanel";
export const dynamic="force-dynamic";
export default async function MasterPage(){
 let master=null;let error=false;
 try{master=await currentMaster()}catch(e){console.error("Master view unavailable",e instanceof Error?e.message:"unknown");error=true}
 return <main className="premium-home"><header className="premium-header"><div className="premium-wrap header-inner"><Link href="/" className="premium-logo"><span>V</span>ENZARO<small>CENTRAL MASTER</small></Link><nav><Link href="/">Início</Link><Link href="/veiculos">Veículos</Link><Link href="/painel">Revendas</Link></nav><Link className="header-cta" href="/">Voltar ao site ↗</Link></div></header><section className="premium-wrap dw-page">{error?<div className="real-status">A central Master está temporariamente indisponível.</div>:master?<MasterDashboard name={master.display_name}/>:<MasterLogin/>}</section></main>
}