import {timingSafeEqual} from "node:crypto";
export function authorized(request:Request):boolean {
 const secret=process.env.VENZARO_ADMIN_API_KEY;
 const provided=request.headers.get("x-admin-api-key");
 if(!secret||!provided||secret.length<32) return false;
 const a=Buffer.from(secret);const b=Buffer.from(provided);
 return a.length===b.length&&timingSafeEqual(a,b);
}
