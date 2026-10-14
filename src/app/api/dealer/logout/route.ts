import {NextResponse} from "next/server";
import {invalidateSession} from "../../../../lib/dealer-auth";
export const runtime="nodejs";
export async function POST(){try{await invalidateSession()}catch(e){console.error("Logout error",e instanceof Error?e.message:"unknown")}return NextResponse.json({ok:true})}