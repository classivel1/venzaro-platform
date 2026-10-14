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
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||name.length<2||name.length>120||password.length<12||password.length>128)return NextResponse.json({error:"E-mail, nome ou senha inválidos (mínimo 12 caracteres)"},{status:400});
 try{await ensureSchema();const hash=await passwordHash(password);
 const r=await getPool().query("INSERT INTO master_users(email,display_name,password_hash) SELECT $1,$2,$3 WHERE NOT EXISTS (SELECT 1 FROM master_users) RETURNING id,email,display_name",[email,name,hash]);
 if(!r.rowCount)return NextResponse.json({error:"Master já inicializado. Nenhuma segunda conta foi criada."},{status:409});
 return NextResponse.json(r.rows[0],{status:201})}
 catch(e){console.error("Master bootstrap failed",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Serviço indisponível"},{status:503})}
}