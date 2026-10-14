import {NextResponse} from "next/server";
import {authorized} from "../../../../lib/admin-auth";
import {getPool} from "../../../../lib/db";
import {ensureSchema} from "../../../../lib/schema";
export const runtime="nodejs";
export async function GET(request:Request){
 if(!authorized(request))return NextResponse.json({error:"Não autorizado"},{status:401});
 const tenantId=new URL(request.url).searchParams.get("tenantId");
 if(!tenantId||!/^[0-9a-f-]{36}$/i.test(tenantId))return NextResponse.json({error:"tenantId obrigatório"},{status:400});
 try{await ensureSchema();const r=await getPool().query("SELECT id,title,category,year,price_cents,status,created_at FROM vehicles WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT 100",[tenantId]);return NextResponse.json({items:r.rows})}catch(e){console.error("Admin list error",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Serviço temporariamente indisponível"},{status:503})}
}
