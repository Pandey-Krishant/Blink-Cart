import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/modals/user.model";

export default async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 1. "/" aur baki routes ko public rakha hai loop rokne ke liye
    const publicRoutes = [
        "/", 
        "/login", 
        "/register", 
        "/api/auth", 
        "/api/user/edit-role-mobile",
        "/forgot-password"
    ];

    const isPublic = publicRoutes.some((path) => 
        path === "/" ? pathname === "/" : pathname.startsWith(path)
    );

    if (isPublic) {
        return NextResponse.next();
    }

    // 2. Auth.js v5 Production Cookies handle karne ke liye update
    let token: any = null;
    try {
        token = await getToken({
            req,
            secret: process.env.AUTH_SECRET,
            // Auth.js v5 production mein __Secure- prefix use karta hai
            secureCookie: process.env.NODE_ENV === "production",
            salt: process.env.NODE_ENV === "production" 
                ? "__Secure-authjs.session-token" 
                : "authjs.session-token",
        });
    } catch (err) {
        console.error("proxy getToken error:", err);
    }

    // Lightweight debug logging
    try {
        const cookieHeader = req.headers.get("cookie")?.slice(0, 150) ?? "(no cookie)";
        console.debug(`[proxy] path=${pathname} hasToken=${!!token} cookie=${cookieHeader}`);
    } catch {}

    if (!token) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", req.url);
        return NextResponse.redirect(loginUrl);
    }

    // 3. Role-based logic FRESH DB lookup ke saath
    let role = token?.role as string | undefined;
    try {
        await connectDB();
        const identifier = token?.email || token?.id || token?.sub;
        if (identifier) {
            const dbUser = await User.findOne({ 
                $or: [{ email: identifier }, { _id: identifier }] 
            }).select("role");
            if (dbUser?.role) role = dbUser.role;
        }
    } catch (err) {
        console.error("proxy role DB lookup failed:", err);
    }

    // Authorization checks
    if (pathname.startsWith("/user") && role !== "user" && pathname !== "/user/delivered") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (pathname.startsWith("/delivery") && role !== "deliveryBoy") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (pathname.startsWith("/admin") && role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api/user/stripe/webhook|api/socket/connect|api/socket/updatelocation|_next/static|_next/image|favicon.ico).*)',
    ],
};