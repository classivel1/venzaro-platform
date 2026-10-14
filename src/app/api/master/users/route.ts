import {NextResponse} from "next/server";
import {currentMaster} from "../../../../lib/master-auth";
import {getPool} from "../../../../lib/db";
export const runtime="nodejs";
export async function GET(){
 try{if(!await currentMaster())return NextResponse.json({error:"Não autorizado"},{status:401});
 const r=await getPool().query("SELECT u.id,u.email,u.display_name,u.is_active,u.created_at,t.name AS tenant_name,t.id AS tenant_id FROM dealer_users u JOIN tenants t ON t.id=u.tenant_id ORDER BY u.created_at DESC LIMIT 100");
 return NextResponse.json({items:r.rows})}
 catch(e){console.error("Master users query error",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Serviço indisponível"},{status:503})}
}
