import {NextResponse} from "next/server";
import {currentMaster} from "../../../../lib/master-auth";
import {getPool} from "../../../../lib/db";
export const runtime="nodejs";
export async function GET(){
 try{if(!await currentMaster())return NextResponse.json({error:"Não autorizado"},{status:401});
 const r=await getPool().query("SELECT v.id,v.title,v.brand,v.model,v.year,v.price_cents,v.status,v.created_at,t.id AS tenant_id,t.name AS tenant_name FROM vehicles v JOIN tenants t ON t.id=v.tenant_id ORDER BY v.created_at DESC LIMIT 100");
 return NextResponse.json({items:r.rows})}
 catch(e){console.error("Master vehicle list error",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Serviço indisponível"},{status:503})}
}
