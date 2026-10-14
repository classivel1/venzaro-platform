import {NextResponse} from "next/server";
import {currentMaster} from "../../../../lib/master-auth";
import {getPool} from "../../../../lib/db";
export const runtime="nodejs";
export async function GET(){
 try{if(!await currentMaster())return NextResponse.json({error:"Não autorizado"},{status:401});
 const r=await getPool().query("SELECT id,actor_role,action,entity_type,entity_id,details,created_at FROM audit_events ORDER BY created_at DESC LIMIT 50");
 return NextResponse.json({items:r.rows})}
 catch(e){console.error("Audit report unavailable",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Serviço indisponível"},{status:503})}
}
