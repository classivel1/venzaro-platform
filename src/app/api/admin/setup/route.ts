import {NextResponse} from "next/server";
import {authorized} from "../../../../lib/admin-auth";
import {ensureSchema} from "../../../../lib/schema";
export const runtime="nodejs";
export async function POST(request:Request){
 if(!authorized(request))return NextResponse.json({error:"Não autorizado"},{status:401});
 try{await ensureSchema();return NextResponse.json({ok:true,message:"Estrutura do banco pronta"})}
 catch(e){console.error("Database initialization failed",e instanceof Error?e.message:"unknown");return NextResponse.json({ok:false,error:"Não foi possível inicializar o banco"},{status:503})}
}
