import {NextResponse} from "next/server";
import {authorized} from "../../../../lib/admin-auth";
import {ensureSchema} from "../../../../lib/schema";
import {getPool} from "../../../../lib/db";
import {passwordHash} from "../../../../lib/dealer-auth";
export const runtime="nodejs";
export async function POST(request:Request){
 if(!authorized(request))return NextResponse.json({error:"Não autorizado"},{status:401});
 let data:Record<string,unknown>;
 try{data=await request.json()}catch{return NextResponse.json({error:"JSON inválido"},{status:400})}
 const tenantId=typeof data.tenantId==="string"?data.tenantId:"",email=typeof data.email==="string"?data.email.trim().toLowerCase():"",name=typeof data.displayName==="string"?data.displayName.trim():"",password=typeof data.password==="string"?data.password:"";
 if(!/^[a-f0-9-]{36}$/i.test(tenantId)||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||name.length<2||name.length>120||password.length<12||password.length>128)return NextResponse.json({error:"Dados inválidos; senha deve ter 12 a 128 caracteres"},{status:400});
 try{await ensureSchema();const hash=await passwordHash(password);const r=await getPool().query("INSERT INTO dealer_users(tenant_id,email,password_hash,display_name) SELECT id,$2,$3,$4 FROM tenants WHERE id=$1 AND status='active' ON CONFLICT(email) DO NOTHING RETURNING id,email,display_name,tenant_id",[tenantId,email,hash,name]);if(!r.rowCount)return NextResponse.json({error:"Revenda inválida ou e-mail já utilizado"},{status:409});return NextResponse.json(r.rows[0],{status:201})}
 catch(e){console.error("Dealer user provision error",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Serviço indisponível"},{status:503})}
}