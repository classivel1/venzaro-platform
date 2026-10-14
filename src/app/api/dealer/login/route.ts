import {NextResponse} from "next/server";
import {getPool} from "../../../../lib/db";
import {ensureSchema} from "../../../../lib/schema";
import {issueSession,passwordMatches,sessionCookie} from "../../../../lib/dealer-auth";
export const runtime="nodejs";
export async function POST(request:Request){
 try{
 const data=await request.json();
 const email=typeof data.email==="string"?data.email.trim().toLowerCase():"";
 const password=typeof data.password==="string"?data.password:"";
 if(email.length>254||password.length>256||!email.includes("@")||!password)return NextResponse.json({error:"Credenciais inválidas"},{status:401});
 await ensureSchema();
 const r=await getPool().query("SELECT u.id,u.password_hash FROM dealer_users u JOIN tenants t ON t.id=u.tenant_id WHERE u.email=$1 AND u.is_active=true AND t.status='active' LIMIT 1",[email]);
 if(!r.rows[0]||!(await passwordMatches(password,r.rows[0].password_hash)))return NextResponse.json({error:"Credenciais inválidas"},{status:401});
 const token=await issueSession(r.rows[0].id);
 const response=NextResponse.json({ok:true});
 response.cookies.set(sessionCookie.name,token,sessionCookie.options);
 return response;
 }catch(e){console.error("Dealer login failed",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Não foi possível entrar no momento"},{status:503})}
}