import {NextResponse} from "next/server";
import {ensureSchema} from "../../../../lib/schema";
import {getPool} from "../../../../lib/db";
import {passwordMatches} from "../../../../lib/dealer-auth";
import {masterCookie,startMasterSession} from "../../../../lib/master-auth";
export const runtime="nodejs";
export async function POST(request:Request){
 let body:Record<string,unknown>;try{body=await request.json()}catch{return NextResponse.json({error:"Credenciais inválidas"},{status:401})}
 const email=typeof body.email==="string"?body.email.trim().toLowerCase():"",password=typeof body.password==="string"?body.password:"";
 if(!email||email.length>254||password.length<1||password.length>256)return NextResponse.json({error:"Credenciais inválidas"},{status:401});
 try{await ensureSchema();const r=await getPool().query("SELECT id,password_hash FROM master_users WHERE email=$1 AND is_active=true LIMIT 1",[email]);
 if(!r.rowCount||!(await passwordMatches(password,r.rows[0].password_hash)))return NextResponse.json({error:"Credenciais inválidas"},{status:401});
 const token=await startMasterSession(r.rows[0].id);const response=NextResponse.json({ok:true});response.cookies.set(masterCookie.name,token,masterCookie.options);return response}
 catch(e){console.error("Master authentication failed",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Serviço indisponível"},{status:503})}
}