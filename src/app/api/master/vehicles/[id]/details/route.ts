import {NextResponse} from "next/server";
import {currentMaster} from "../../../../../../lib/master-auth";
import {getPool} from "../../../../../../lib/db";
import {recordAudit} from "../../../../../../lib/audit";
export const runtime="nodejs";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 try{
 const master=await currentMaster();if(!master)return NextResponse.json({error:"Não autorizado"},{status:401});
 const {id}=await params;
 if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id))return NextResponse.json({error:"Veículo inválido"},{status:400});
 const data=await request.json();
 const title=typeof data.title==="string"?data.title.trim():"";
 const priceCents=data.priceCents;
 if(title.length<5||title.length>140||!Number.isSafeInteger(priceCents)||priceCents<=0)return NextResponse.json({error:"Título e preço inválidos"},{status:400});
 const r=await getPool().query("UPDATE vehicles SET title=$1,price_cents=$2,updated_at=now() WHERE id=$3 RETURNING id,title,price_cents",[title,priceCents,id]);
 if(!r.rowCount)return NextResponse.json({error:"Veículo não encontrado"},{status:404});
 await recordAudit("master",master.id,"vehicle.details","vehicle",id,{title,priceCents});return NextResponse.json(r.rows[0]);
 }catch(e){console.error("Master vehicle details update failed",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Serviço indisponível"},{status:503})}
}
