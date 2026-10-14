import {NextResponse} from "next/server";
import {currentMaster} from "../../../../lib/master-auth";
import {getPool} from "../../../../lib/db";
export const runtime="nodejs";
export async function POST(request:Request){
 try{if(!await currentMaster())return NextResponse.json({error:"Não autorizado"},{status:401});
 const body=await request.json();const name=typeof body.name==="string"?body.name.trim():"",slug=typeof body.slug==="string"?body.slug.trim().toLowerCase():"";
 if(name.length<2||name.length>120||!/^[a-z0-9-]{3,60}$/.test(slug))return NextResponse.json({error:"Nome ou identificador inválido"},{status:400});
 const r=await getPool().query("INSERT INTO tenants(name,slug) VALUES($1,$2) ON CONFLICT(slug) DO NOTHING RETURNING id,name,slug,status",[name,slug]);if(!r.rowCount)return NextResponse.json({error:"Identificador já utilizado"},{status:409});return NextResponse.json(r.rows[0],{status:201})}
 catch(e){console.error("Master tenant creation unavailable",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Serviço indisponível"},{status:503})}
}
