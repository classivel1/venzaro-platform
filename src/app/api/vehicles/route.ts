import {NextResponse} from "next/server";
import {getPool} from "../../../lib/db";
import {authorized} from "../../../lib/admin-auth";
export const runtime="nodejs";
function fail(error:unknown){console.error("Vehicle API error",error instanceof Error?error.message:"unknown");return NextResponse.json({error:"Serviço temporariamente indisponível"},{status:503})}
export async function GET(request:Request){
 try{
  const url=new URL(request.url);const tenant=url.searchParams.get("tenant");const category=url.searchParams.get("category");const q=(url.searchParams.get("q")||"").trim().slice(0,100);
  if(category&&!["carro","moto"].includes(category))return NextResponse.json({error:"Categoria inválida"},{status:400});
  const values:unknown[]=[];const conditions=["v.status='published'","t.status='active'"];
  if(tenant){values.push(tenant);conditions.push("t.slug=$"+values.length)}
  if(category){values.push(category);conditions.push("v.category=$"+values.length)}
  if(q){values.push("%"+q+"%");conditions.push("(v.title ILIKE $"+values.length+" OR v.brand ILIKE $"+values.length+" OR v.model ILIKE $"+values.length+")")}
  const sql="SELECT v.id,v.title,v.brand,v.model,v.category,v.year,v.price_cents,v.mileage,v.fuel,v.transmission,v.city,v.description,v.created_at,t.name AS seller_name,t.slug AS tenant_slug FROM vehicles v JOIN tenants t ON t.id=v.tenant_id WHERE "+conditions.join(" AND ")+" ORDER BY v.created_at DESC LIMIT 60";
  const result=await getPool().query(sql,values);
  return NextResponse.json({items:result.rows});
 }catch(error){return fail(error)}
}
export async function POST(request:Request){
 if(!authorized(request))return NextResponse.json({error:"Não autorizado"},{status:401});
 let body:Record<string,unknown>;
 try{body=await request.json()}catch{return NextResponse.json({error:"JSON inválido"},{status:400})}
 const text=(key:string,max:number)=>typeof body[key]==="string"?(body[key] as string).trim().slice(0,max):"";
 const tenantId=text("tenantId",40),title=text("title",140),brand=text("brand",80),model=text("model",80),category=text("category",10),fuel=text("fuel",40),transmission=text("transmission",40),city=text("city",120),description=text("description",5000);
 const year=body.year,mileage=body.mileage,priceCents=body.priceCents;
 if(!/^[0-9a-f-]{36}$/i.test(tenantId)||title.length<5||!brand||!model||!["carro","moto"].includes(category)||!fuel||!transmission||!city||!Number.isInteger(year)||(year as number)<1900||(year as number)>2100||!Number.isSafeInteger(mileage)||(mileage as number)<0||!Number.isSafeInteger(priceCents)||(priceCents as number)<=0)return NextResponse.json({error:"Dados inválidos"},{status:400});
 try{
  const result=await getPool().query("INSERT INTO vehicles(tenant_id,title,brand,model,category,year,price_cents,mileage,fuel,transmission,city,description,status) SELECT id,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'draft' FROM tenants WHERE id=$1 AND status='active' RETURNING id,status", [tenantId,title,brand,model,category,year,priceCents,mileage,fuel,transmission,city,description]);
  if(!result.rowCount)return NextResponse.json({error:"Revenda não encontrada ou inativa"},{status:404});
  return NextResponse.json(result.rows[0],{status:201});
 }catch(error){return fail(error)}
}
