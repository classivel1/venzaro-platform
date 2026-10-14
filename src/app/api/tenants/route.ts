import {NextResponse} from "next/server";
import {getPool} from "../../../lib/db";
import {ensureSchema} from "../../../lib/schema";
import {authorized} from "../../../lib/admin-auth";
export const runtime="nodejs";
export async function POST(request:Request){
 if(!authorized(request))return NextResponse.json({error:"Não autorizado"},{status:401});
 try{await ensureSchema()}catch(e){console.error("Tenant schema error",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Serviço temporariamente indisponível"},{status:503})}
 let body:Record<string,unknown>;try{body=await request.json()}catch{return NextResponse.json({error:"JSON inválido"},{status:400})}
 const name=typeof body.name==="string"?body.name.trim():"";const slug=typeof body.slug==="string"?body.slug.trim().toLowerCase():"";
 if(name.length<2||name.length>120||!/^[a-z0-9-]{3,60}$/.test(slug))return NextResponse.json({error:"Nome ou identificador inválido"},{status:400});
 try{const result=await getPool().query("INSERT INTO tenants(name,slug) VALUES($1,$2) ON CONFLICT(slug) DO NOTHING RETURNING id,name,slug", [name,slug]);if(!result.rowCount)return NextResponse.json({error:"Identificador já utilizado"},{status:409});return NextResponse.json(result.rows[0],{status:201})}catch(e){console.error("Tenant API error",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Serviço temporariamente indisponível"},{status:503})}
}
