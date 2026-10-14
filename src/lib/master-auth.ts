import {cookies} from "next/headers";
import {getPool} from "./db";
import {ensureSchema} from "./schema";
import {hashToken,newSessionToken} from "./dealer-auth";
const COOKIE="venzaro_master_session";
export const masterCookie={name:COOKIE,options:{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax" as const,path:"/",maxAge:604800}};
export type Master={id:string;email:string;display_name:string};
export async function currentMaster():Promise<Master|null>{
 const token=(await cookies()).get(COOKIE)?.value;
 if(!token||!/^[a-f0-9]{64}$/.test(token))return null;
 await ensureSchema();
 const r=await getPool().query<Master>("SELECT u.id,u.email,u.display_name FROM master_sessions s JOIN master_users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now() AND u.is_active=true LIMIT 1",[hashToken(token)]);
 return r.rows[0]??null;
}
export async function startMasterSession(userId:string){const token=newSessionToken();await getPool().query("INSERT INTO master_sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '7 days')",[hashToken(token),userId]);return token}
export async function endMasterSession(){const jar=await cookies();const token=jar.get(COOKIE)?.value;if(token&&/^[a-f0-9]{64}$/.test(token))await getPool().query("DELETE FROM master_sessions WHERE token_hash=$1",[hashToken(token)]);jar.delete(COOKIE)}
