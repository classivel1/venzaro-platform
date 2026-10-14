import {createHash} from "node:crypto";
import {getPool} from "./db";
const WINDOW_MINUTES=15;
const MAX_FAILURES=20;
function keyFor(request:Request,scope:string){
 const supplied=request.headers.get("x-forwarded-for")?.split(",")[0].trim()||"unknown";
 const ip=supplied.slice(0,80);
 return createHash("sha256").update(scope+":"+ip).digest("hex");
}
export async function loginAllowed(request:Request,scope:"dealer"|"master"){
 const key=keyFor(request,scope);
 const r=await getPool().query("SELECT failures,expires_at FROM auth_attempts WHERE key=$1",[key]);
 const entry=r.rows[0];
 return !entry||new Date(entry.expires_at).getTime()<Date.now()||entry.failures<MAX_FAILURES;
}
export async function loginFailed(request:Request,scope:"dealer"|"master"){
 const key=keyFor(request,scope);
 await getPool().query(`INSERT INTO auth_attempts(key,failures,expires_at)
 VALUES($1,1,now()+interval '15 minutes')
 ON CONFLICT(key) DO UPDATE SET failures=CASE WHEN auth_attempts.expires_at<now() THEN 1 ELSE auth_attempts.failures+1 END,
 expires_at=CASE WHEN auth_attempts.expires_at<now() THEN now()+interval '15 minutes' ELSE auth_attempts.expires_at END`,[key]);
}
export async function loginSucceeded(request:Request,scope:"dealer"|"master"){
 await getPool().query("DELETE FROM auth_attempts WHERE key=$1",[keyFor(request,scope)]);
}
