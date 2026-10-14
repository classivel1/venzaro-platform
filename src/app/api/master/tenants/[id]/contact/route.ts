import {NextResponse} from "next/server";
import {currentMaster} from "../../../../../../lib/master-auth";
import {getPool} from "../../../../../../lib/db";
export const runtime="nodejs";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 try{if(!await currentMaster())return NextResponse.json({error:"Não autorizado"},{status:401});
 const {id}=await params;if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id))return NextResponse.json({error:"Revenda inválida"},{status:400});
 const body=await request.json();const raw=typeof body.whatsapp==="string"?body.whatsapp.trim():"";const phone=raw.replace(/[^0-9]/g,"");
 if(raw&&(phone.length<12||phone.length>13||!phone.startsWith("55")))return NextResponse.json({error:"Informe telefone com 55 + DDD + número, ou deixe vazio"},{status:400});
 const r=await getPool().query("UPDATE tenants SET whatsapp=$1 WHERE id=$2 RETURNING id,name,whatsapp",[phone||null,id]);
 if(!r.rowCount)return NextResponse.json({error:"Revenda não encontrada"},{status:404});return NextResponse.json(r.rows[0])
 }catch(e){console.error("Master contact update failed",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Serviço indisponível"},{status:503})}
}
