import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/modals/user.model";

export async function proxy(req:NextRequest){
    
    const {pathname}=req.nextUrl
    const publicRoutes=["/login","/register","/api/auth"]
    if(publicRoutes.some((path)=>pathname.startsWith(path))){
        return NextResponse.next()
    }
    const token=await getToken({req,secret:process.env.AUTH_SECRET})
    console.log(token)
    if(!token){
        const loginUrl=new URL("/login",req.url)
        console.log(loginUrl)
        loginUrl.searchParams.set("callbackUrl",req.url)
        return NextResponse.redirect(loginUrl)
    }
    // Prefer DB role in case JWT is stale after role change
    let role = (token as any).role
    try {
        await connectDB()
        const dbUser = (token as any)?.email ? await User.findOne({ email: (token as any).email }).select("role") : null
        if (dbUser?.role) role = dbUser.role
    } catch (err) {
        // if DB fails, fall back to token role
        console.error("proxy role DB lookup failed:", err)
    }
    if(pathname.startsWith("/user")&& role!=="user"){
        return NextResponse.redirect(new URL("/unauthorized",req.url))
    }
       if(pathname.startsWith("/delivery")&& role!=="deliveryBoy"){
        return NextResponse.redirect(new URL("/unauthorized",req.url))
    }
        if(pathname.startsWith("/admin")&& role!=="admin"){
        return NextResponse.redirect(new URL("/unauthorized",req.url))
    }




    return NextResponse.next()
}

export const config={
   matcher: [
    // Webhook ko ignore karne ke liye exclusion daalo
    '/((?!api/user/stripe/webhook|_next/static|_next/image|favicon.ico).*)',
  ],
}