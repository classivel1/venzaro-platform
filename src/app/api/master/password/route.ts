import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {currentMaster,masterCookie} from "../../../../lib/master-auth";
import {passwordHash,passwordMatches} from "../../../../lib/dealer-auth";
import {getPool} from "../../../../lib/db";
export const runtime="nodejs";
export async function POST(request:Request){
 try{const master=await currentMaster();if(!master)return NextResponse.json({error:"Não autorizado"},{status:401});
 const body=await request.json();const old=typeof body.currentPassword==="string"?body.currentPassword:"",next=typeof body.newPassword==="string"?body.newPassword:"";
 if(!old||next.length<12||next.length>128||next===old)return NextResponse.json({error:"Informe uma senha diferente, com 12 a 128 caracteres"},{status:400});
 const r=await getPool().query("SELECT password_hash FROM master_users WHERE id=$1",[master.id]);
 if(!r.rowCount||!await passwordMatches(old,r.rows[0].password_hash))return NextResponse.json({error:"Senha atual incorreta"},{status:403});
 const hash=await passwordHash(next),client=await getPool().connect();
 try{await client.query("BEGIN");await client.query("UPDATE master_users SET password_hash=$1 WHERE id=$2",[hash,master.id]);await client.query("DELETE FROM master_sessions WHERE user_id=$1",[master.id]);await client.query("COMMIT")}catch(e){await client.query("ROLLBACK");throw e}finally{client.release()}
 (await cookies()).delete(masterCookie.name);return NextResponse.json({ok:true,message:"Senha alterada. Entre novamente."})
 }catch(e){console.error("Master password change error",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Serviço indisponível"},{status:503})}
}
