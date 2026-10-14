import {NextResponse} from "next/server";
import {currentDealer} from "../../../../lib/dealer-auth";
import {currentMaster} from "../../../../lib/master-auth";
import {getPool} from "../../../../lib/db";
export const runtime="nodejs";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 try{const {id}=await params;if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id))return new Response(null,{status:404});
 const r=await getPool().query<{mime_type:string;bytes:Buffer;status:string;tenant_status:string;tenant_id:string}>("SELECT p.mime_type,p.bytes,v.status,t.status AS tenant_status,v.tenant_id FROM vehicle_photo_blobs p JOIN vehicles v ON v.id=p.vehicle_id JOIN tenants t ON t.id=v.tenant_id WHERE p.id=$1 LIMIT 1",[id]);
 const photo=r.rows[0];if(!photo)return new Response(null,{status:404});
 if(photo.status!=="published"||photo.tenant_status!=="active"){
 const dealer=await currentDealer();if(dealer?.tenant_id!==photo.tenant_id&&!await currentMaster())return new Response(null,{status:404});
 }
 return new Response(new Uint8Array(photo.bytes),{headers:{"Content-Type":photo.mime_type,"X-Content-Type-Options":"nosniff","Cache-Control":"private, max-age=60","Content-Security-Policy":"default-src 'none'; sandbox"}});
 }catch(e){console.error("Image read unavailable",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Imagem indisponível"},{status:503})}
}
