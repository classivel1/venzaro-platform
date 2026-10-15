"use client";
import {useState} from "react";
export default function ListingGallery({title,images}:{title:string;images:string[]}){
 const [selected,setSelected]=useState(0),[notice,setNotice]=useState("");
 async function share(){const url=window.location.href;try{if(navigator.share){await navigator.share({title,url})}else{await navigator.clipboard.writeText(url);setNotice("Link do anúncio copiado!")}}catch{setNotice("Não foi possível compartilhar agora.")}}
 return <div className="mp-gallery"><div className="mp-gallery-main">{images.length?<img src={images[selected]} alt={"Foto "+(selected+1)+" de "+title}/>:<div className="mp-gallery-empty">🚘<span>Fotos ainda não cadastradas</span></div>}<span className="mp-gallery-index">{images.length?selected+1+" / "+images.length:"Sem fotos"}</span>{images.length>1&&<><button className="mp-gallery-prev" type="button" aria-label="Foto anterior" onClick={()=>setSelected(i=>(i-1+images.length)%images.length)}>‹</button><button className="mp-gallery-next" type="button" aria-label="Próxima foto" onClick={()=>setSelected(i=>(i+1)%images.length)}>›</button></>}</div>
 {images.length>1&&<div className="mp-gallery-thumbs">{images.map((url,i)=><button className={selected===i?"selected":""} type="button" key={i} aria-label={"Visualizar foto "+(i+1)} onClick={()=>setSelected(i)}><img src={url} alt={""}/></button>)}</div>}
 <div className="mp-gallery-actions"><button type="button" onClick={()=>void share()}>↗ Compartilhar anúncio</button>{notice&&<small role="status">{notice}</small>}</div></div>
}
