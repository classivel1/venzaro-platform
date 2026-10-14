import {NextResponse} from "next/server";
import {currentDealer} from "../../../../../../lib/dealer-auth";
import {getPool} from "../../../../../../lib/db";
export const runtime="nodejs";
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const maxSize=1200000;
function mime(bytes:Buffer):string|null{
 if(bytes.length>=3&&bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return "image/jpeg";
 if(bytes.length>=8&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return "image/png";
 if(bytes.length>=12&&bytes.toString("ascii",0,4)==="RIFF"&&bytes.toString("ascii",8,12)==="WEBP")return "image/webp";
 return null;
}
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 try{const dealer=await currentDealer();if(!dealer)return NextResponse.json({error:"Não autorizado"},{status:401});const {id}=await params;if(!uuid.test(id))return NextResponse.json({error:"ID inválido"},{status:400});
 const r=await getPool().query("SELECT p.id,p.position,octet_length(p.bytes)::int AS size FROM vehicle_photo_blobs p JOIN vehicles v ON v.id=p.vehicle_id WHERE p.vehicle_id=$1 AND v.tenant_id=$2 ORDER BY p.position,p.created_at",[id,dealer.tenant_id]);
 return NextResponse.json({items:r.rows.map(p=>({...p,url:"/api/media/"+p.id}))})}
 catch(e){console.error("Photos read failed",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Serviço indisponível"},{status:503})}
}
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 try{const dealer=await currentDealer();if(!dealer)return NextResponse.json({error:"Não autorizado"},{status:401});const {id}=await params;if(!uuid.test(id))return NextResponse.json({error:"ID inválido"},{status:400});
 if(Number(request.headers.get("content-length")||"0")>maxSize+150000)return NextResponse.json({error:"Imagem muito grande"},{status:413});
 const form=await request.formData();const file=form.get("photo");if(!(file instanceof File)||file.size===0||file.size>maxSize)return NextResponse.json({error:"Escolha uma imagem JPG, PNG ou WebP de até 1,2 MB"},{status:400});
 const bytes=Buffer.from(await file.arrayBuffer());const kind=mime(bytes);
 if(!kind)return NextResponse.json({error:"Formato de imagem não permitido"},{status:400});
 const client=await getPool().connect();
 try{await client.query("BEGIN");const vehicle=await client.query("SELECT id FROM vehicles WHERE id=$1 AND tenant_id=$2 FOR UPDATE",[id,dealer.tenant_id]);if(!vehicle.rowCount){await client.query("ROLLBACK");return NextResponse.json({error:"Veículo não encontrado"},{status:404})}
 const n=await client.query("SELECT count(*)::int AS qty,coalesce(sum(octet_length(bytes)),0)::int AS total FROM vehicle_photo_blobs WHERE vehicle_id=$1",[id]);
 if(n.rows[0].qty>=5||n.rows[0].total+bytes.length>5500000){await client.query("ROLLBACK");return NextResponse.json({error:"Limite de cinco fotos ou 5,5 MB por veículo"},{status:409})}
 const r=await client.query("INSERT INTO vehicle_photo_blobs(vehicle_id,mime_type,bytes,position) VALUES($1,$2,$3,$4) RETURNING id",[id,kind,bytes,n.rows[0].qty]);await client.query("COMMIT");
 return NextResponse.json({id:r.rows[0].id,url:"/api/media/"+r.rows[0].id},{status:201})
 }catch(e){await client.query("ROLLBACK");throw e}finally{client.release()}
 }catch(e){console.error("Photo upload failed",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Não foi possível salvar a foto"},{status:503})}
}
