import {NextRequest,NextResponse} from "next/server";
export function middleware(request:NextRequest){
 const method=request.method.toUpperCase();
 if(["GET","HEAD","OPTIONS"].includes(method))return NextResponse.next();
 const origin=request.headers.get("origin");
 const allowed=new URL(request.url).origin;
 if(!origin||origin!==allowed)return NextResponse.json({error:"Origem da solicitação não permitida"},{status:403});
 return NextResponse.next();
}
export const config={matcher:["/api/master/:path*","/api/dealer/:path*"]};
