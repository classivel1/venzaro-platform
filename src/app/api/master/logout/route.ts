import {NextResponse} from "next/server";
import {endMasterSession} from "../../../../lib/master-auth";
export const runtime="nodejs";
export async function POST(){try{await endMasterSession()}catch(e){console.error("Master logout failed",e instanceof Error?e.message:"unknown")}return NextResponse.json({ok:true})}
