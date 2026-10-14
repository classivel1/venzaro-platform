import {NextResponse} from "next/server";
import {currentMaster} from "../../../../../lib/master-auth";
import {getPool} from "../../../../../lib/db";
export const runtime="nodejs";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 try{if(!await currentMaster())return NextResponse.json({error:"Não autorizado"},{status:401});
 const {id}=await params;
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))return NextResponse.json({error:"ID inválido"},{status:400});
 const data=await request.json();
 if(!["draft","published","archived"].includes(data.status))return NextResponse.json({error:"Status inválido"},{status:400});
 const r=await getPool().query("UPDATE vehicles SET status=$1,updated_at=now() WHERE id=$2 RETURNING id,status",[data.status,id]);
 if(!r.rowCount)return NextResponse.json({error:"Anúncio não encontrado"},{status:404});
 return NextResponse.json(r.rows[0])}
 catch(e){console.error("Master moderation error",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Serviço indisponível"},{status:503})}
}
