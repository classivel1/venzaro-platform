import {NextResponse} from "next/server";
import {currentDealer} from "../../../../../lib/dealer-auth";
import {getPool} from "../../../../../lib/db";
export const runtime="nodejs";
export async function DELETE(_request:Request,{params}:{params:Promise<{id:string}>}){
 try{const dealer=await currentDealer();if(!dealer)return NextResponse.json({error:"Não autorizado"},{status:401});const {id}=await params;
 if(!/^[a-f0-9-]{36}$/i.test(id))return NextResponse.json({error:"ID inválido"},{status:400});
 const r=await getPool().query("DELETE FROM vehicle_photo_blobs p USING vehicles v WHERE p.vehicle_id=v.id AND p.id=$1 AND v.tenant_id=$2 RETURNING p.id",[id,dealer.tenant_id]);
 if(!r.rowCount)return NextResponse.json({error:"Foto não encontrada"},{status:404});return NextResponse.json({ok:true})
 }catch(e){console.error("Photo removal failed",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Serviço indisponível"},{status:503})}
}
