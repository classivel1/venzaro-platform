import {getPool} from "./db";
export async function recordAudit(role:"master"|"dealer"|"system",actorId:string|null,action:string,entityType:string,entityId:string,details:Record<string,unknown>={}){
 try{await getPool().query("INSERT INTO audit_events(actor_role,actor_id,action,entity_type,entity_id,details) VALUES($1,$2,$3,$4,$5,$6::jsonb)",[role,actorId,action,entityType,entityId,JSON.stringify(details)])}
 catch(e){console.error("VENZARO audit write unavailable",e instanceof Error?e.message:"unknown")}
}
