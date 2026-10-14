import {createHash,randomBytes,scrypt as scryptCallback,timingSafeEqual} from "node:crypto";
import {promisify} from "node:util";
import {cookies} from "next/headers";
import {getPool} from "./db";
import {ensureSchema} from "./schema";
const scrypt=promisify(scryptCallback);
const COOKIE="venzaro_dealer_session";
export async function passwordHash(password:string){const salt=randomBytes(16).toString("hex");const buf=await scrypt(password,salt,64) as Buffer;return salt+":"+buf.toString("hex")}
export async function passwordMatches(password:string,stored:string){const [salt,hash]=stored.split(":");if(!salt||!hash||!/^[a-f0-9]{32}$/.test(salt)||!/^[a-f0-9]{128}$/.test(hash))return false;const actual=await scrypt(password,salt,64) as Buffer;const expected=Buffer.from(hash,"hex");return timingSafeEqual(actual,expected)}
export const hashToken=(token:string)=>createHash("sha256").update(token).digest("hex");
export function newSessionToken(){return randomBytes(32).toString("hex")}
export async function issueSession(userId:string){const token=newSessionToken();await getPool().query("INSERT INTO dealer_sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '7 days')",[hashToken(token),userId]);return token}
export const sessionCookie={name:COOKIE,options:{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax" as const,path:"/",maxAge:604800}};
export type Dealer={id:string;tenant_id:string;email:string;display_name:string;tenant_name:string};
export async function currentDealer():Promise<Dealer|null>{const jar=await cookies();const token=jar.get(COOKIE)?.value;if(!token||!/^[a-f0-9]{64}$/.test(token))return null;await ensureSchema();const r=await getPool().query<Dealer>("SELECT u.id,u.tenant_id,u.email,u.display_name,t.name AS tenant_name FROM dealer_sessions s JOIN dealer_users u ON u.id=s.user_id JOIN tenants t ON t.id=u.tenant_id WHERE s.token_hash=$1 AND s.expires_at>now() AND u.is_active=true AND t.status='active' LIMIT 1",[hashToken(token)]);return r.rows[0]||null}
export async function invalidateSession(){const jar=await cookies();const token=jar.get(COOKIE)?.value;if(token&&/^[a-f0-9]{64}$/.test(token))await getPool().query("DELETE FROM dealer_sessions WHERE token_hash=$1",[hashToken(token)]);jar.delete(COOKIE)}
