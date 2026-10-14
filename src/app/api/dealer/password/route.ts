import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {currentDealer,passwordHash,passwordMatches,hashToken,sessionCookie} from "../../../../lib/dealer-auth";
import {getPool} from "../../../../lib/db";
export const runtime="nodejs";
export async function POST(request:Request){
 try{const dealer=await currentDealer();if(!dealer)return NextResponse.json({error:"Não autorizado"},{status:401});
 const body=await request.json();const old=typeof body.currentPassword==="string"?body.currentPassword:"",next=typeof body.newPassword==="string"?body.newPassword:"";
 if(!old||next.length<12||next.length>128||old===next)return NextResponse.json({error:"Informe a senha atual e uma senha nova de 12 a 128 caracteres"},{status:400});
 const existing=await getPool().query("SELECT password_hash FROM dealer_users WHERE id=$1",[dealer.id]);
 if(!existing.rowCount||!await passwordMatches(old,existing.rows[0].password_hash))return NextResponse.json({error:"Senha atual incorreta"},{status:403});
 const hash=await passwordHash(next);const client=await getPool().connect();
 try{await client.query("BEGIN");await client.query("UPDATE dealer_users SET password_hash=$1 WHERE id=$2",[hash,dealer.id]);await client.query("DELETE FROM dealer_sessions WHERE user_id=$1",[dealer.id]);await client.query("COMMIT")}catch(e){await client.query("ROLLBACK");throw e}finally{client.release()}
 (await cookies()).delete(sessionCookie.name);return NextResponse.json({ok:true,message:"Senha alterada. Faça login novamente."})
 }catch(e){console.error("Dealer password change error",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Serviço indisponível"},{status:503})}
}
