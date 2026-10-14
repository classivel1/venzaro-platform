import {NextResponse} from "next/server";
import {ensureSchema} from "../../../lib/schema";
import {getPool} from "../../../lib/db";
export const runtime="nodejs";
export async function GET(){
 try{await ensureSchema();await getPool().query("SELECT 1");return NextResponse.json({status:"ready",database:"connected"})}
 catch(e){console.error("VENZARO readiness failed",e instanceof Error?e.message:"unknown");return NextResponse.json({status:"unavailable",database:"unreachable"},{status:503})}
}
