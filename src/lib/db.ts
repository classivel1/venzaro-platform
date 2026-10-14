import {Pool} from "pg";
declare global {var venzaroPool: Pool | undefined}
export function getPool():Pool {
 const url=process.env.DATABASE_URL;
 if(!url) throw new Error("DATABASE_URL_NOT_CONFIGURED");
 if(!globalThis.venzaroPool) globalThis.venzaroPool=new Pool({connectionString:url,max:5,connectionTimeoutMillis:5000,ssl:process.env.DATABASE_SSL==="true"?{rejectUnauthorized:true}:undefined});
 return globalThis.venzaroPool;
}
