import {NextResponse} from "next/server";
import {currentMaster} from "../../../../../../lib/master-auth";
import {getPool} from "../../../../../../lib/db";
import {passwordHash} from "../../../../../../lib/dealer-auth";
export const runtime="nodejs";
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 try{if(!await currentMaster())return NextResponse.json({error:"Não autorizado"},{status:401});
 const {id}=await params;if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id))return NextResponse.json({error:"ID inválido"},{status:400});
 const body=await request.json();const password=typeof body.newPassword==="string"?body.newPassword:"";
 if(password.length<12||password.length>128)return NextResponse.json({error:"Senha deve conter entre 12 e 128 caracteres"},{status:400});
 const hash=await passwordHash(password),client=await getPool().connect();
 try{await client.query("BEGIN");const r=await client.query("UPDATE dealer_users SET password_hash=$1 WHERE id=$2 RETURNING id,email",[hash,id]);if(!r.rowCount){await client.query("ROLLBACK");return NextResponse.json({error:"Usuário não encontrado"},{status:404})}
 await client.query("DELETE FROM dealer_sessions WHERE user_id=$1",[id]);await client.query("COMMIT");return NextResponse.json({ok:true,email:r.rows[0].email})}
 catch(e){await client.query("ROLLBACK");throw e}finally{client.release()}
 }catch(e){console.error("Master dealer reset error",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Não foi possível redefinir senha"},{status:503})}
}
