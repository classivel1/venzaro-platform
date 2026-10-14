import {NextResponse} from "next/server";
import {currentMaster} from "../../../../../lib/master-auth";
import {getPool} from "../../../../../lib/db";
export const runtime="nodejs";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 try{if(!await currentMaster())return NextResponse.json({error:"Não autorizado"},{status:401});
 const {id}=await params;
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))return NextResponse.json({error:"ID inválido"},{status:400});
 const data=await request.json();
 if(typeof data.isActive!=="boolean")return NextResponse.json({error:"Situação inválida"},{status:400});
 const client=await getPool().connect();
 try{await client.query("BEGIN");
 const r=await client.query("UPDATE dealer_users SET is_active=$1 WHERE id=$2 RETURNING id,email,is_active",[data.isActive,id]);
 if(!r.rowCount){await client.query("ROLLBACK");return NextResponse.json({error:"Usuário não encontrado"},{status:404})}
 if(!data.isActive)await client.query("DELETE FROM dealer_sessions WHERE user_id=$1",[id]);
 await client.query("COMMIT");return NextResponse.json(r.rows[0])}
 catch(e){await client.query("ROLLBACK");throw e}finally{client.release()}
 }catch(e){console.error("Master user update error",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Serviço indisponível"},{status:503})}
}
