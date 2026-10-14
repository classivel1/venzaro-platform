import {NextResponse} from "next/server";
import {currentMaster} from "../../../../lib/master-auth";
import {getPool} from "../../../../lib/db";
import {recordAudit} from "../../../../lib/audit";
export const runtime="nodejs";
export async function GET(){
 try{if(!await currentMaster())return NextResponse.json({error:"Não autorizado"},{status:401});
 const r=await getPool().query("SELECT u.id,u.email,u.display_name,u.is_active,u.created_at,t.name AS tenant_name,t.id AS tenant_id FROM dealer_users u JOIN tenants t ON t.id=u.tenant_id ORDER BY u.created_at DESC LIMIT 100");
 return NextResponse.json({items:r.rows})}
 catch(e){console.error("Master users query error",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Serviço indisponível"},{status:503})}
}


export async function POST(request:Request){
 try{
 const master=await currentMaster();
 if(!master)return NextResponse.json({error:"Não autorizado"},{status:401});
 const body=await request.json();
 const email=typeof body.email==="string"?body.email.trim().toLowerCase():"";
 const name=typeof body.displayName==="string"?body.displayName.trim():"";
 const tenantId=typeof body.tenantId==="string"?body.tenantId:"";
 const password=typeof body.password==="string"?body.password:"";
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||name.length<2||name.length>120||!/^[a-f0-9]{8}-[a-f0-9-]{27}$/i.test(tenantId)||password.length<12||password.length>128)
 return NextResponse.json({error:"Confira nome, e-mail, revenda e senha de 12 a 128 caracteres"},{status:400});
 const {passwordHash}=await import("../../../../lib/dealer-auth");
 const hash=await passwordHash(password);
 const r=await getPool().query("INSERT INTO dealer_users(tenant_id,email,display_name,password_hash) SELECT id,$2,$3,$4 FROM tenants WHERE id=$1 AND status='active' ON CONFLICT(email) DO NOTHING RETURNING id,email,display_name,tenant_id",[tenantId,email,name,hash]);
 if(!r.rowCount)return NextResponse.json({error:"E-mail já cadastrado ou revenda indisponível"},{status:409});
 await recordAudit("master",master.id,"user.create","dealer_user",r.rows[0].id,{tenantId});return NextResponse.json(r.rows[0],{status:201});
 }catch(e){console.error("Master user create error",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Não foi possível cadastrar usuário"},{status:503})}
}
