import {NextResponse} from "next/server";
export function GET(){return NextResponse.json({status:"ok",service:"venzaro-platform",version:"0.2.0"});}
