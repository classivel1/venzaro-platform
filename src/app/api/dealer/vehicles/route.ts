import {NextResponse} from "next/server";
import {currentDealer} from "../../../../lib/dealer-auth";
import {getPool} from "../../../../lib/db";
export const runtime="nodejs";
export async function GET(){try{const user=await currentDealer();if(!user)return NextResponse.json({error:"Não autorizado"},{status:401});const r=await getPool().query("SELECT v.id,v.title,v.brand,v.model,v.year,v.category,v.price_cents,v.mileage,v.fuel,v.transmission,v.city,v.description,v.status,v.created_at,COALESCE((SELECT json_agg(json_build_object('id',p.id,'url','/api/media/' || p.id::text) ORDER BY p.position,p.created_at) FROM vehicle_photo_blobs p WHERE p.vehicle_id=v.id),'[]'::json) AS photos FROM vehicles v WHERE v.tenant_id=$1 ORDER BY created_at DESC LIMIT 100",[user.tenant_id]);return NextResponse.json({items:r.rows})}catch(e){console.error("Dealer list error",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Serviço indisponível"},{status:503})}}
export async function POST(request:Request){try{
 const user=await currentDealer();if(!user)return NextResponse.json({error:"Não autorizado"},{status:401});
 const data=await request.json();const get=(key:string,max:number)=>typeof data[key]==="string"?data[key].trim().slice(0,max):"";
 const title=get("title",140),brand=get("brand",80),model=get("model",80),category=get("category",10),fuel=get("fuel",40),transmission=get("transmission",40),city=get("city",120),description=get("description",5000);
 const year=Number(data.year),mileage=Number(data.mileage),priceCents=Number(data.priceCents);
 if(title.length<5||!brand||!model||!["carro","moto"].includes(category)||!fuel||!transmission||!city||!Number.isInteger(year)||year<1900||year>2100||!Number.isSafeInteger(mileage)||mileage<0||!Number.isSafeInteger(priceCents)||priceCents<=0)return NextResponse.json({error:"Verifique os campos do veículo"},{status:400});
 const r=await getPool().query("INSERT INTO vehicles(tenant_id,title,brand,model,category,year,price_cents,mileage,fuel,transmission,city,description,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'draft') RETURNING id,status",[user.tenant_id,title,brand,model,category,year,priceCents,mileage,fuel,transmission,city,description]);
 return NextResponse.json(r.rows[0],{status:201})
 }catch(e){console.error("Dealer create error",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Serviço indisponível"},{status:503})}}
