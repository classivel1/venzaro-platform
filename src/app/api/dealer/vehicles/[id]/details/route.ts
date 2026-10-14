import {NextResponse} from "next/server";
import {currentDealer} from "../../../../../../lib/dealer-auth";
import {getPool} from "../../../../../../lib/db";
import {recordAudit} from "../../../../../../lib/audit";
export const runtime="nodejs";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 try{const user=await currentDealer();if(!user)return NextResponse.json({error:"Não autorizado"},{status:401});
 const {id}=await params;if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id))return NextResponse.json({error:"ID inválido"},{status:400});
 const body=await request.json();const str=(key:string,max:number)=>typeof body[key]==="string"?body[key].trim().slice(0,max):"";
 const title=str("title",140),brand=str("brand",80),model=str("model",80),category=str("category",10),fuel=str("fuel",40),transmission=str("transmission",40),city=str("city",120),description=str("description",5000);
 const year=body.year,mileage=body.mileage,priceCents=body.priceCents;
 if(title.length<5||!brand||!model||!["carro","moto"].includes(category)||!fuel||!transmission||!city||!Number.isInteger(year)||year<1900||year>2100||!Number.isSafeInteger(mileage)||mileage<0||!Number.isSafeInteger(priceCents)||priceCents<=0)return NextResponse.json({error:"Verifique os campos do anúncio"},{status:400});
 const r=await getPool().query("UPDATE vehicles SET title=$1,brand=$2,model=$3,category=$4,year=$5,price_cents=$6,mileage=$7,fuel=$8,transmission=$9,city=$10,description=$11,updated_at=now() WHERE id=$12 AND tenant_id=$13 RETURNING id,status",[title,brand,model,category,year,priceCents,mileage,fuel,transmission,city,description,id,user.tenant_id]);
 if(!r.rowCount)return NextResponse.json({error:"Anúncio não encontrado"},{status:404});await recordAudit("dealer",user.id,"vehicle.details","vehicle",id,{title,priceCents});return NextResponse.json(r.rows[0])
 }catch(e){console.error("Dealer edit error",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Serviço indisponível"},{status:503})}
}
