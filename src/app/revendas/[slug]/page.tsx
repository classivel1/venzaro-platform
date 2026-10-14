import Link from "next/link";
import {notFound} from "next/navigation";
import {getPool} from "../../../lib/db";
import {ensureSchema} from "../../../lib/schema";
export const dynamic="force-dynamic";
type Tenant={id:string;name:string;slug:string;whatsapp:string|null};
type Vehicle={id:string;title:string;year:number;price_cents:string;mileage:number;city:string;image_url:string|null};
export default async function Revenda({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 if(!/^[a-z0-9-]{3,60}$/.test(slug))notFound();
 let tenant:Tenant|undefined,vehicles:Vehicle[]=[];let unavailable=false;
 try{await ensureSchema();const r=await getPool().query<Tenant>("SELECT id,name,slug,whatsapp FROM tenants WHERE slug=$1 AND status='active' LIMIT 1",[slug]);tenant=r.rows[0];
 if(tenant){const list=await getPool().query<Vehicle>("SELECT v.id,v.title,v.year,v.price_cents,v.mileage,v.city,COALESCE((SELECT '/api/media/' || p.id::text FROM vehicle_photo_blobs p WHERE p.vehicle_id=v.id ORDER BY p.position,p.created_at LIMIT 1),(SELECT vi.url FROM vehicle_images vi WHERE vi.vehicle_id=v.id ORDER BY vi.position,vi.id LIMIT 1)) AS image_url FROM vehicles v WHERE v.tenant_id=$1 AND v.status='published' ORDER BY v.created_at DESC LIMIT 60",[tenant.id]);vehicles=list.rows}
 }catch(e){console.error("Dealer profile unavailable",e instanceof Error?e.message:"unknown");unavailable=true}
 if(!unavailable&&!tenant)notFound();
 const money=(n:string)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(Number(n)/100);
 return <main className="premium-home"><header className="premium-header"><div className="premium-wrap header-inner"><Link href="/" className="premium-logo"><span>V</span>ENZARO<small>MARKETPLACE AUTOMOTIVO</small></Link><Link href="/veiculos" className="header-cta">Ver veículos ↗</Link></div></header><section className="premium-wrap" style={{paddingTop:55,paddingBottom:85,minHeight:"65vh"}}>{unavailable?<div className="real-status">Revenda temporariamente indisponível.</div>:tenant&&<><div className="catalog-cover" style={{padding:35,borderRadius:12,marginBottom:30}}><p className="overline">REVENDAS / VENZARO</p><h1>{tenant.name}</h1><p>Veículos anunciados por esta revenda no VENZARO</p></div>{tenant.whatsapp&&<p><a className="premium-red-btn" href={"https://wa.me/"+tenant.whatsapp} target="_blank" rel="noopener noreferrer">CONTATAR REVENDA PELO WHATSAPP ↗</a></p>}<div className="results-head"><div><p className="overline">CATÁLOGO DA REVENDA</p><h2>Veículos publicados</h2><p>{vehicles.length} anúncios</p></div></div>{vehicles.length===0?<div className="real-status">Esta revenda ainda não possui veículos publicados.</div>:<div className="catalog-grid">{vehicles.map(v=><Link href={"/anuncios/"+v.id} className="premium-listing" key={v.id}><div className="listing-photo real-photo">{v.image_url?<img src={v.image_url} alt={v.title}/>:<div className="real-photo-placeholder">SEM FOTO</div>}</div><div className="listing-info"><h3>{v.title}</h3><p>{v.year} · {v.mileage} km · {v.city}</p><div className="listing-bottom"><strong>{money(v.price_cents)}</strong><span>VER ANÚNCIO ↗</span></div></div></Link>)}</div>}</>}</section></main>
}
