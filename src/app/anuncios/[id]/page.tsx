import Link from "next/link";
import {notFound} from "next/navigation";
import {getPool} from "../../../lib/db";
import {ensureSchema} from "../../../lib/schema";
export const dynamic="force-dynamic";
const fmt=(n:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(n);
type Listing={id:string;title:string;category:string;brand:string;model:string;year:number;price_cents:string;mileage:number;fuel:string;transmission:string;city:string;description:string;seller_name:string;image_url:string|null};
export default async function PublishedVehicle({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))notFound();
 let v:Listing|undefined;
 let unavailable=false;
 try{
 await ensureSchema();
 const r=await getPool().query<Listing>(`SELECT v.id,v.title,v.category,v.brand,v.model,v.year,v.price_cents,v.mileage,v.fuel,v.transmission,v.city,v.description,t.name AS seller_name,COALESCE((SELECT '/api/media/' || pb.id::text FROM vehicle_photo_blobs pb WHERE pb.vehicle_id=v.id ORDER BY pb.position,pb.created_at LIMIT 1),(SELECT vi.url FROM vehicle_images vi WHERE vi.vehicle_id=v.id ORDER BY vi.position,vi.id LIMIT 1)) AS image_url FROM vehicles v INNER JOIN tenants t ON t.id=v.tenant_id WHERE v.id=$1 AND v.status='published' AND t.status='active' LIMIT 1`,[id]);
 v=r.rows[0];
 }catch(e){console.error("Published listing read failed",e instanceof Error?e.message:"unknown");unavailable=true}
 if(!v&&!unavailable)notFound();
 return <div className="premium-home"><header className="premium-header"><div className="premium-wrap header-inner"><Link href="/" className="premium-logo"><span>V</span>ENZARO<small>MARKETPLACE AUTOMOTIVO</small></Link><nav><Link href="/">Início</Link><Link href="/veiculos">Veículos</Link></nav><Link href="/veiculos" className="header-cta">Voltar ao catálogo ↗</Link></div></header><main className="premium-wrap premium-detail">{unavailable?<div className="real-status" role="status">Anúncio temporariamente indisponível. Tente novamente mais tarde.</div>:v&&<><div className="detail-breadcrumb"><Link href="/">Início</Link> / <Link href="/veiculos">Veículos</Link> / <span>{v.title}</span></div><div className="detail-heading"><div><p className="overline">ANÚNCIO PUBLICADO</p><h1>{v.title}</h1><p>⌖ {v.city} · {v.category==="moto"?"Moto":"Carro"} · {v.year}</p></div><Link className="outline-dark" href="/veiculos">← VOLTAR</Link></div><div className="detail-layout"><div><div className="detail-photo real-detail-photo">{v.image_url?<img src={v.image_url} alt={"Foto do veículo "+v.title}/>:<div className="real-photo-placeholder">FOTO NÃO CADASTRADA</div>}</div><section className="detail-description"><p className="overline">ESPECIFICAÇÕES DO ANÚNCIO</p><h2>Detalhes do veículo</h2><div className="detail-specgrid">{[["Marca",v.brand],["Modelo",v.model],["Ano",String(v.year)],["Quilometragem",new Intl.NumberFormat("pt-BR").format(v.mileage)+" km"],["Combustível",v.fuel],["Câmbio",v.transmission]].map(([label,value])=><div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div><h3>Descrição do anunciante</h3><p>{v.description||"Descrição não informada."}</p></section></div><aside className="detail-right"><div className="detail-price-card"><p className="overline">VALOR ANUNCIADO</p><strong>{fmt(Number(v.price_cents)/100)}</strong><span>Anunciado por {v.seller_name}</span><div className="detail-contact-disabled">CONTATO AINDA NÃO DISPONÍVEL</div><Link className="outline-dark" href="/veiculos">EXPLORAR OUTROS ANÚNCIOS ↗</Link></div><div className="detail-safety"><strong>VENZARO</strong><p>Confira os dados diretamente com a revenda. Não faça pagamentos antecipados sem verificar a procedência do veículo.</p></div></aside></div></>}</main></div>
}
