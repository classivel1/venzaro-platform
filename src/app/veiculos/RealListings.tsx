"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
type Listing={id:string;title:string;brand:string;model:string;category:string;year:number;price_cents:string|number;mileage:number;fuel:string;transmission:string;city:string;seller_name:string;image_url?:string|null};
export default function RealListings(){
 const [items,setItems]=useState<Listing[]>([]);const [state,setState]=useState<"loading"|"ready"|"error">("loading");
 useEffect(()=>{const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);
 fetch("/api/vehicles",{signal:controller.signal,cache:"no-store"}).then(async r=>{if(!r.ok)throw Error("unavailable");return r.json()}).then(d=>{setItems(Array.isArray(d.items)?d.items:[]);setState("ready")}).catch(()=>{if(!controller.signal.aborted)setState("error");else setState("error")}).finally(()=>clearTimeout(timer));
 return()=>{clearTimeout(timer);controller.abort()}},[]);
 const brl=(n:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(n);
 return <section className="real-listings" aria-label="Anúncios publicados"><div className="real-listings-heading"><div><p className="overline">ANÚNCIOS PUBLICADOS</p><h2>Ofertas <em>das revendas</em></h2></div><span className="real-count">{state==="ready"?items.length+" anúncio(s)":"Catálogo ao vivo"}</span></div>
 {state==="loading"&&<div className="real-status" role="status">Carregando anúncios publicados...</div>}
 {state==="error"&&<div className="real-status" role="status">Não foi possível carregar anúncios reais agora. Tente novamente mais tarde.</div>}
 {state==="ready"&&items.length===0&&<div className="real-status">Ainda não há anúncios reais publicados. Veja abaixo exemplos de como os veículos serão apresentados.</div>}
 {state==="ready"&&items.length>0&&<div className="catalog-grid">{items.map(v=><Link key={v.id} href={"/anuncios/"+v.id} className="premium-listing"><div className="listing-photo real-photo">{v.image_url?<img src={v.image_url} alt={"Foto de "+v.title}/>:<span className="real-photo-placeholder">{v.category==="moto"?"MOTO":"CARRO"}<small>Sem foto cadastrada</small></span>}<span className="listing-chip">PUBLICADO</span></div><div className="listing-info"><div className="listing-top"><h3>{v.title}</h3><small>{v.seller_name}</small></div><div className="listing-facts"><span>{v.year}</span><span>{new Intl.NumberFormat("pt-BR").format(v.mileage)} km</span></div><p className="listing-city">⌖ {v.city}</p><div className="listing-bottom"><strong>{brl(Number(v.price_cents)/100)}</strong><span>VER ANÚNCIO ↗</span></div></div></Link>)}</div>}</section>
}
