"use client";
import {useCallback,useEffect,useState} from "react";
import Link from "next/link";
type Listing={id:string;title:string;brand:string;model:string;category:string;year:number;price_cents:string|number;mileage:number;fuel:string;transmission:string;city:string;seller_name:string;tenant_slug:string;image_url?:string|null};
type Filters={q:string;category:string;brand:string;city:string;minPrice:string;maxPrice:string;minYear:string;maxYear:string;sort:string};
const defaults:Filters={q:"",category:"",brand:"",city:"",minPrice:"",maxPrice:"",minYear:"",maxYear:"",sort:"recentes"};
const money=(x:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(x/100);
const FAVORITES="venzaro-marketplace-favorites-v1";
function readFavorites(){try{const a=JSON.parse(localStorage.getItem(FAVORITES)||"[]");return Array.isArray(a)?a.filter((x:unknown)=>typeof x==="string"):[]}catch{return []}}
export default function MarketplaceCatalog(){
 const [filters,setFilters]=useState<Filters>(defaults),[items,setItems]=useState<Listing[]>([]),[favorites,setFavorites]=useState<string[]>([]),[tab,setTab]=useState<"all"|"favorites">("all"),[filtersOpen,setFiltersOpen]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState(""),[total,setTotal]=useState(0),[page,setPage]=useState(1),[pages,setPages]=useState(1);
 useEffect(()=>{const params=new URLSearchParams(window.location.search);setFilters(f=>({...f,q:params.get("q")||"",category:params.get("category")||"",city:params.get("city")||""}));setFavorites(readFavorites())},[]);
 const load=useCallback(async (signal:AbortSignal)=>{
 setLoading(true);setError("");
 try{const params=new URLSearchParams();Object.entries(filters).forEach(([key,value])=>{if(value&&!(key==="sort"&&value==="recentes"))params.set(key,value)});params.set("page",String(page));
 const response=await fetch("/api/vehicles?"+params.toString(),{cache:"no-store",signal});if(!response.ok)throw Error("Não foi possível carregar os anúncios. Tente atualizar a página.");
 const data=await response.json();if(!signal.aborted){setItems(data.items||[]);setTotal(data.total||0);setPages(data.pages||1)}}
 catch(e){if(!signal.aborted)setError(e instanceof Error?e.message:"Falha ao consultar anúncios")}finally{if(!signal.aborted)setLoading(false)}
 },[filters,page]);
 useEffect(()=>{const c=new AbortController();void load(c.signal);return()=>c.abort()},[load]);
 function update(key:keyof Filters,value:string){setFilters(f=>({...f,[key]:value}));setPage(1)}
 function toggleFavorite(id:string){setFavorites(prev=>{const next=prev.includes(id)?prev.filter(x=>x!==id):[...prev,id];try{localStorage.setItem(FAVORITES,JSON.stringify(next))}catch{}return next})}
 const visible=tab==="favorites"?items.filter(x=>favorites.includes(x.id)):items;
 const hasFilters=Object.entries(filters).some(([k,v])=>k==="sort"?v!=="recentes":v!=="");
 return <div className="mp-shell">
 <header className="mp-top"><div className="mp-header-inner"><Link href="/" className="mp-logo"><span>V</span>ENZARO <small>MARKETPLACE</small></Link><nav aria-label="Menu principal"><Link href="/veiculos" className="mp-nav-current">Explorar</Link><Link href="/painel">Meus anúncios</Link><Link href="/master">Administração</Link></nav><Link href="/painel" className="mp-sell">+ Publicar veículo</Link></div></header>
 <main className="mp-layout">
 <aside className={"mp-side "+(filtersOpen?"mp-side-open":"")} aria-label="Filtros de anúncios"><div className="mp-side-title"><div><small>VENZARO MARKETPLACE</small><h2>Veículos</h2></div><button type="button" className="mp-close" onClick={()=>setFiltersOpen(false)} aria-label="Fechar filtros">✕</button></div>
 <label className="mp-field">Buscar no marketplace<input placeholder="O que você procura?" value={filters.q} onChange={e=>update("q",e.target.value)}/></label>
 <div className="mp-categories"><strong>Categorias</strong><button className={!filters.category?"active":""} onClick={()=>update("category","")}>⌂ &nbsp; Todos os veículos</button><button className={filters.category==="carro"?"active":""} onClick={()=>update("category","carro")}>◈ &nbsp; Carros e SUVs</button><button className={filters.category==="moto"?"active":""} onClick={()=>update("category","moto")}>◇ &nbsp; Motos</button></div>
 <div className="mp-divider"/>
 <label className="mp-field">Localização<input placeholder="Cidade ou estado" value={filters.city} onChange={e=>update("city",e.target.value)}/></label>
 <label className="mp-field">Marca<input placeholder="Toyota, Honda, Ford..." value={filters.brand} onChange={e=>update("brand",e.target.value)}/></label>
 <div className="mp-two"><label className="mp-field">Preço mínimo (R$)<input type="number" min="0" placeholder="0" value={filters.minPrice} onChange={e=>update("minPrice",e.target.value)}/></label><label className="mp-field">Preço máximo (R$)<input type="number" min="0" placeholder="Sem limite" value={filters.maxPrice} onChange={e=>update("maxPrice",e.target.value)}/></label></div>
 <div className="mp-two"><label className="mp-field">Ano de<input type="number" min="1900" max="2100" placeholder="1900" value={filters.minYear} onChange={e=>update("minYear",e.target.value)}/></label><label className="mp-field">Ano até<input type="number" min="1900" max="2100" placeholder="Atual" value={filters.maxYear} onChange={e=>update("maxYear",e.target.value)}/></label></div>
 <button type="button" className="mp-clear" onClick={()=>{setFilters(defaults);setPage(1)}}>Limpar todos os filtros</button>
 <div className="mp-side-help"><strong>Negocie com segurança</strong><p>Converse com a revenda, confira a documentação e não antecipe pagamentos sem verificar o veículo.</p></div>
 </aside>
 <section className="mp-main">
 <div className="mp-headline"><div><div className="mp-eyebrow">DESCUBRA SEU PRÓXIMO VEÍCULO</div><h1>Encontre o que você procura.</h1><p>Carros e motos anunciados por revendas no VENZARO.</p></div><Link className="mp-publish-lg" href="/painel">+ Criar anúncio</Link></div>
 <div className="mp-mobile-actions"><button onClick={()=>setFiltersOpen(v=>!v)}>☷ Filtrar anúncios</button><Link href="/painel">+ Anunciar</Link></div>
 <div className="mp-toolbar"><div className="mp-tabs"><button className={tab==="all"?"active":""} onClick={()=>setTab("all")}>Explorar anúncios</button><button className={tab==="favorites"?"active":""} onClick={()=>setTab("favorites")}>♡ Favoritos ({favorites.length})</button></div><label>Ordenar <select value={filters.sort} onChange={e=>update("sort",e.target.value)}><option value="recentes">Mais recentes</option><option value="menor">Menor preço</option><option value="maior">Maior preço</option><option value="ano">Ano mais novo</option><option value="km">Menor quilometragem</option></select></label></div>
 <div className="mp-count"><strong>{loading?"Carregando...":tab==="all"?total+" anúncio(s) disponíveis":visible.length+" favorito(s) nesta página"}</strong>{hasFilters&&<button onClick={()=>setFilters(defaults)}>Remover filtros ×</button>}</div>
 {loading&&<div className="mp-empty">Buscando veículos disponíveis...</div>}
 {error&&!loading&&<div className="mp-empty" role="alert">{error}<p><button onClick={()=>{const c=new AbortController();void load(c.signal)}}>Tentar novamente</button></p></div>}
 {!loading&&!error&&visible.length===0&&<div className="mp-empty"><span>⌕</span><h2>{tab==="favorites"?"Seus favoritos ainda não aparecem aqui":"Nenhum anúncio encontrado"}</h2><p>{tab==="favorites"?"Use o coração dos anúncios para salvá-los neste navegador. Os favoritos são mostrados quando correspondem à página e aos filtros atuais.":"Altere a busca, localização ou faixa de preço para encontrar outras opções."}</p><button onClick={()=>{setFilters(defaults);setTab("all");setPage(1)}}>Explorar todos os veículos</button></div>}
 {!loading&&!error&&visible.length>0&&<div className="mp-grid">{visible.map(v=><article className="mp-card" key={v.id}><Link className="mp-card-photo" href={"/anuncios/"+v.id}>{v.image_url?<img src={v.image_url} alt={"Foto de "+v.title}/>:<div className="mp-no-photo">🚗 <small>Foto não cadastrada</small></div>}<span className="mp-card-tag">VENZARO</span></Link><button type="button" className={"mp-fav "+(favorites.includes(v.id)?"active":"")} onClick={()=>toggleFavorite(v.id)} aria-label={favorites.includes(v.id)?"Remover dos favoritos":"Adicionar aos favoritos"} aria-pressed={favorites.includes(v.id)}>{favorites.includes(v.id)?"♥":"♡"}</button><Link href={"/anuncios/"+v.id} className="mp-card-content"><strong>{money(Number(v.price_cents))}</strong><h3>{v.title}</h3><p>{v.year} · {new Intl.NumberFormat("pt-BR").format(v.mileage)} km · {v.transmission}</p><div className="mp-card-bottom"><span>⌖ {v.city}</span><small>{v.seller_name}</small></div></Link></article>)}</div>}
 {!loading&&!error&&tab==="all"&&pages>1&&<div className="mp-pages"><button disabled={page===1} onClick={()=>setPage(n=>n-1)}>← Anterior</button><span>Página {page} de {pages}</span><button disabled={page>=pages} onClick={()=>setPage(n=>n+1)}>Próxima →</button></div>}
 <div className="mp-explainer">O VENZARO conecta compradores e revendas. Cada anúncio é responsabilidade de seu anunciante. Verifique os detalhes antes de fechar negócio.</div>
 </section></main></div>
}
