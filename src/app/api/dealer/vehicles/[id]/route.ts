import {NextResponse} from "next/server";
import {currentDealer} from "../../../../../lib/dealer-auth";
import {getPool} from "../../../../../lib/db";
import {recordAudit} from "../../../../../lib/audit";
export const runtime="nodejs";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 try{const user=await currentDealer();if(!user)return NextResponse.json({error:"Não autorizado"},{status:401});
 const {id}=await params;
 if(!/^[a-f0-9]{8}-[a-f0-9-]{27}$/i.test(id))return NextResponse.json({error:"ID inválido"},{status:400});
 const body=await request.json();const status=body.status;
 if(!["draft","published","archived"].includes(status))return NextResponse.json({error:"Status inválido"},{status:400});
 const r=await getPool().query("UPDATE vehicles SET status=$1,updated_at=now() WHERE id=$2 AND tenant_id=$3 RETURNING id,status",[status,id,user.tenant_id]);
 if(!r.rowCount)return NextResponse.json({error:"Anúncio não encontrado"},{status:404});
 await recordAudit("dealer",user.id,"vehicle.status","vehicle",id,{status});return NextResponse.json(r.rows[0]);
 }catch(e){console.error("Dealer update error",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Serviço indisponível"},{status:503})}}
