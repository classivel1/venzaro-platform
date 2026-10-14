import Link from "next/link";
import {currentDealer} from "../../lib/dealer-auth";
import DealerLogin from "./DealerLogin";
import DealerWorkspace from "./DealerWorkspace";
export const dynamic="force-dynamic";
export default async function Painel(){let dealer=null;let unavailable=false;try{dealer=await currentDealer()}catch(e){console.error("Dealer dashboard auth unavailable",e instanceof Error?e.message:"unknown");unavailable=true}
return <main className="premium-home"><header className="premium-header"><div className="premium-wrap header-inner"><Link href="/" className="premium-logo"><span>V</span>ENZARO<small>ÁREA DA REVENDA</small></Link><nav><Link href="/">Início</Link><Link href="/veiculos">Veículos</Link></nav><Link className="header-cta" href="/veiculos">Explorar veículos ↗</Link></div></header><section className="premium-wrap dw-page">{unavailable?<div className="real-status" role="status">O painel está temporariamente indisponível. Tente novamente em instantes.</div>:dealer?<DealerWorkspace dealer={dealer.display_name} tenant={dealer.tenant_name}/>:<DealerLogin/>}</section></main>}