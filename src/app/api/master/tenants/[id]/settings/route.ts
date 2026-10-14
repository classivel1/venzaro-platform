import {NextResponse} from "next/server";
import {currentMaster} from "../../../../../../lib/master-auth";
import {getPool} from "../../../../../../lib/db";
export const runtime="nodejs";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 try{if(!await currentMaster())return NextResponse.json({error:"Não autorizado"},{status:401});
 const {id}=await params;if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id))return NextResponse.json({error:"Revenda inválida"},{status:400});
 const data=await request.json();
 const plan=typeof data.planCode==="string"?data.planCode:"";
 const status=typeof data.subscriptionStatus==="string"?data.subscriptionStatus:"";
 const color=typeof data.brandColor==="string"?data.brandColor:"";
 const logo=typeof data.logoUrl==="string"?data.logoUrl.trim():"";
 if(!["starter","professional","enterprise"].includes(plan)||!["trial","active","past_due","cancelled"].includes(status)||!/^#[0-9a-fA-F]{6}$/.test(color)||logo.length>1000||(logo&&!/^https:\/\/[^\s]+$/i.test(logo)))return NextResponse.json({error:"Verifique os dados do plano e da marca"},{status:400});
 const r=await getPool().query("UPDATE tenants SET plan_code=$1,subscription_status=$2,brand_color=$3,logo_url=$4 WHERE id=$5 RETURNING id,name,plan_code,subscription_status,brand_color,logo_url",[plan,status,color.toLowerCase(),logo||null,id]);
 if(!r.rowCount)return NextResponse.json({error:"Revenda não encontrada"},{status:404});
 return NextResponse.json(r.rows[0]);
 }catch(e){console.error("SaaS settings update failed",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Serviço indisponível"},{status:503})}
}
