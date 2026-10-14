import {NextResponse} from "next/server";
import {authorized} from "../../../../lib/admin-auth";
import {ensureSchema} from "../../../../lib/schema";
import {getPool} from "../../../../lib/db";
import {passwordHash} from "../../../../lib/dealer-auth";
export const runtime="nodejs";
export async function POST(request:Request){
 if(!authorized(request))return NextResponse.json({error:"Não autorizado"},{status:401});
 let body:Record<string,unknown>;try{body=await request.json()}catch{return NextResponse.json({error:"JSON inválido"},{status:400})}
 const email=typeof body.email==="string"?body.email.trim().toLowerCase():"",name=typeof body.displayName==="string"?body.displayName.trim():"",password=typeof body.password==="string"?body.password:"";
 const owner=process.env.VENZARO_MASTER_OWNER_EMAIL?.trim().toLowerCase();
 if(!owner||email!==owner)return NextResponse.json({error:"E-mail Master não autorizado"},{status:403});
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||name.length<2||name.length>120||password.length<12||password.length>128)return NextResponse.json({error:"E-mail, nome ou senha inválidos (mínimo 12 caracteres)"},{status:400});
 let client;
 try{await ensureSchema();const hash=await passwordHash(password);
 client=await getPool().connect();await client.query("BEGIN");
 await client.query("SELECT pg_advisory_xact_lock(78312211)");
 const existing=await client.query("SELECT id FROM master_users LIMIT 1");
 if(existing.rowCount){await client.query("ROLLBACK");return NextResponse.json({error:"Master já inicializado. Nenhuma segunda conta foi criada."},{status:409})}
 const r=await client.query("INSERT INTO master_users(email,display_name,password_hash) VALUES($1,$2,$3) RETURNING id,email,display_name",[email,name,hash]);
 await client.query("COMMIT");
 return NextResponse.json(r.rows[0],{status:201})}
 catch(e){if(client)try{await client.query("ROLLBACK")}catch{}console.error("Master bootstrap failed",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Serviço indisponível"},{status:503})}finally{client?.release()}
}