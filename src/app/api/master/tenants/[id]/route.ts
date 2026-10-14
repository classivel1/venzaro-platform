import {NextResponse} from "next/server";
import {currentMaster} from "../../../../../lib/master-auth";
import {getPool} from "../../../../../lib/db";
import {recordAudit} from "../../../../../lib/audit";
export const runtime="nodejs";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 try{const master=await currentMaster();if(!master)return NextResponse.json({error:"Não autorizado"},{status:401});
 const {id}=await params;if(!/^[a-f0-9-]{36}$/i.test(id))return NextResponse.json({error:"Identificador inválido"},{status:400});
 const body=await request.json();if(!["active","suspended"].includes(body.status))return NextResponse.json({error:"Status inválido"},{status:400});
 const r=await getPool().query("UPDATE tenants SET status=$1 WHERE id=$2 RETURNING id,name,slug,status",[body.status,id]);if(!r.rowCount)return NextResponse.json({error:"Revenda não encontrada"},{status:404});await recordAudit("master",master.id,"tenant.status","tenant",id,{status:body.status});return NextResponse.json(r.rows[0])
 catch(e){console.error("Master tenant update unavailable",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Serviço indisponível"},{status:503})}
}
