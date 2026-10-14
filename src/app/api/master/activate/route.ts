import {NextResponse} from "next/server";
import {createHash,timingSafeEqual} from "node:crypto";
import {ensureSchema} from "../../../../lib/schema";
import {getPool} from "../../../../lib/db";
import {passwordHash} from "../../../../lib/dealer-auth";
import {startMasterSession,masterCookie} from "../../../../lib/master-auth";
export const runtime="nodejs";
const digest=(value:string)=>createHash("sha256").update(value).digest();
export async function POST(request:Request){
 let body:Record<string,unknown>;
 try{body=await request.json()}catch{return NextResponse.json({error:"Dados inválidos"},{status:400})}
 const email=typeof body.email==="string"?body.email.trim().toLowerCase():"";
 const password=typeof body.password==="string"?body.password:"";
 const code=typeof body.code==="string"?body.code:"";
 const owner=process.env.VENZARO_MASTER_OWNER_EMAIL?.trim().toLowerCase();
 const secret=process.env.VENZARO_MASTER_ACTIVATION_TOKEN||"";
 const expiry=Date.parse(process.env.VENZARO_MASTER_ACTIVATION_EXPIRES||"");
 if(!owner||secret.length<32||!Number.isFinite(expiry)||Date.now()>expiry)return NextResponse.json({error:"Ativação indisponível ou expirada"},{status:403});
 if(email!==owner||password.length<12||password.length>128||code.length>256||!timingSafeEqual(digest(code),digest(secret)))return NextResponse.json({error:"Dados de ativação inválidos"},{status:403});
 let client;
 try{
 await ensureSchema();
 const hash=await passwordHash(password);
 client=await getPool().connect();
 await client.query("BEGIN");
 await client.query("SELECT pg_advisory_xact_lock(873064209)");
 const existing=await client.query("SELECT id FROM master_users LIMIT 1");
 if(existing.rowCount){await client.query("ROLLBACK");return NextResponse.json({error:"A conta Master já foi inicializada"},{status:409})}
 const added=await client.query("INSERT INTO master_users(email,display_name,password_hash) VALUES($1,$2,$3) RETURNING id",[email,"Administrador Master",hash]);
 await client.query("COMMIT");
 const token=await startMasterSession(added.rows[0].id);
 const response=NextResponse.json({ok:true});response.cookies.set(masterCookie.name,token,masterCookie.options);
 return response;
 }catch(e){if(client)try{await client.query("ROLLBACK")}catch{}console.error("Master activation unavailable",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Ativação indisponível"},{status:503})}
 finally{client?.release()}
}
