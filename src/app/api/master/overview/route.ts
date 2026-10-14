import {NextResponse} from "next/server";
import {currentMaster} from "../../../../lib/master-auth";
import {getPool} from "../../../../lib/db";
export const runtime="nodejs";
export async function GET(){
 try{const master=await currentMaster();if(!master)return NextResponse.json({error:"Não autorizado"},{status:401});
 const [tenants,vehicles,users,latest]=await Promise.all([
 getPool().query("SELECT COUNT(*)::int AS total,COUNT(*) FILTER(WHERE status='active')::int AS active FROM tenants"),
 getPool().query("SELECT COUNT(*)::int AS total,COUNT(*) FILTER(WHERE status='published')::int AS published,COUNT(*) FILTER(WHERE status='draft')::int AS drafts FROM vehicles"),
 getPool().query("SELECT COUNT(*)::int AS total FROM dealer_users"),
 getPool().query("SELECT id,name,slug,status,created_at FROM tenants ORDER BY created_at DESC LIMIT 50")
 ]);return NextResponse.json({tenants:tenants.rows[0],vehicles:vehicles.rows[0],users:users.rows[0],latestTenants:latest.rows})}
 catch(e){console.error("Master overview unavailable",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Serviço indisponível"},{status:503})}
}