import {NextResponse} from "next/server";
import {getPool} from "../../../lib/db";
import {ensureSchema} from "../../../lib/schema";
import {authorized} from "../../../lib/admin-auth";
export const runtime="nodejs";
function fail(error:unknown){console.error("Vehicle API error",error instanceof Error?error.message:"unknown");return NextResponse.json({error:"Serviço temporariamente indisponível"},{status:503})}
export async function GET(request:Request){
 try{
 await ensureSchema();
 const q=new URL(request.url).searchParams;
 const get=(name:string,max=100)=>(q.get(name)||"").trim().slice(0,max);
 const category=get("category",20),brand=get("brand",80),city=get("city",120),search=get("q",120),sort=get("sort",20);
 if(category&&!["carro","moto"].includes(category))return NextResponse.json({error:"Categoria inválida"},{status:400});
 if(sort&&!["recentes","menor","maior","ano","km"].includes(sort))return NextResponse.json({error:"Ordenação inválida"},{status:400});
 const num=(name:string)=>{const raw=get(name,18);if(!raw)return null;const n=Number(raw);return Number.isSafeInteger(n)&&n>=0?n:NaN};
 const min=num("minPrice"),max=num("maxPrice"),minYear=num("minYear"),maxYear=num("maxYear");
 if([min,max,minYear,maxYear].some(x=>Number.isNaN(x))||(min!==null&&max!==null&&min>max)||(minYear!==null&&maxYear!==null&&minYear>maxYear))return NextResponse.json({error:"Filtros inválidos"},{status:400});
 const page=Math.min(100,Math.max(1,Number(q.get("page"))||1)),limit=24;
 const values:unknown[]=[];const conditions=["v.status='published'","t.status='active'"];
 function add(sql:string,value:unknown){values.push(value);conditions.push(sql.replace("?","$"+values.length))}
 if(category)add("v.category=?",category);
 if(brand)add("v.brand ILIKE ?",brand);
 if(city)add("v.city ILIKE ?","%"+city+"%");
 if(search){const val="%"+search+"%";values.push(val);const p="$"+values.length;conditions.push("(v.title ILIKE "+p+" OR v.brand ILIKE "+p+" OR v.model ILIKE "+p+" OR v.city ILIKE "+p+")")}
 if(q.get("tenant"))add("t.slug=?",get("tenant",60));
 if(min!==null)add("v.price_cents>=?",min*100);
 if(max!==null)add("v.price_cents<=?",max*100);
 if(minYear!==null)add("v.year>=?",minYear);
 if(maxYear!==null)add("v.year<=?",maxYear);
 const order:Record<string,string>={recentes:"v.created_at DESC",menor:"v.price_cents ASC",maior:"v.price_cents DESC",ano:"v.year DESC",km:"v.mileage ASC"};
 const base="FROM vehicles v JOIN tenants t ON t.id=v.tenant_id WHERE "+conditions.join(" AND ");
 const count=await getPool().query("SELECT COUNT(*)::int AS total "+base,values);
 const columns="SELECT v.id,v.title,v.brand,v.model,v.category,v.year,v.price_cents,v.mileage,v.fuel,v.transmission,v.city,v.description,v.created_at,t.name AS seller_name,t.slug AS tenant_slug,COALESCE((SELECT '/api/media/' || pb.id::text FROM vehicle_photo_blobs pb WHERE pb.vehicle_id=v.id ORDER BY pb.position,pb.created_at LIMIT 1),(SELECT vi.url FROM vehicle_images vi WHERE vi.vehicle_id=v.id ORDER BY vi.position,vi.id LIMIT 1)) AS image_url ";
 const result=await getPool().query(columns+base+" ORDER BY "+(order[sort]||order.recentes)+",v.id DESC LIMIT "+limit+" OFFSET "+((page-1)*limit),values);
 return NextResponse.json({items:result.rows,total:count.rows[0].total,page,pages:Math.max(1,Math.ceil(count.rows[0].total/limit))},{headers:{"Cache-Control":"no-store"}});
 }catch(error){return fail(error)}
}
export async function POST(request:Request){
 if(!authorized(request))return NextResponse.json({error:"Não autorizado"},{status:401});
 try{await ensureSchema()}catch(error){return fail(error)}
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
