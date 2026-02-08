import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/modals/user.model";

export default async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const publicRoutes = [
        "/", "/login", "/register", "/api/auth", 
        "/api/user/edit-role-mobile", "/forgot-password"
    ];

    const isPublic = publicRoutes.some((path) => 
        path === "/" ? pathname === "/" : pathname.startsWith(path)
    );

    if (isPublic) return NextResponse.next();

    let token: any = null;
    try {
        token = await getToken({
            req,
            secret: process.env.AUTH_SECRET,
            secureCookie: process.env.NODE_ENV === "production",
            salt: process.env.NODE_ENV === "production" 
                ? "__Secure-authjs.session-token" 
                : "authjs.session-token",
        });
    } catch (err) {
        console.error("proxy getToken error:", err);
    }

    if (!token) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", req.url);
        return NextResponse.redirect(loginUrl);
    }

    // --- FIX: CastError logic and Delivery Check ---
    let role = token?.role as string | undefined;
    try {
        await connectDB();
        const identifier = token?.email || token?.id || token?.sub;
        
        if (identifier) {
            let query: any = {};
            // Agar identifier email hai toh sirf email mein dhundo (CastError se bachne ke liye)
            if (identifier.includes("@")) {
                query = { email: identifier };
            } else if (identifier.length === 24) {
                query = { _id: identifier };
            }

            if (Object.keys(query).length > 0) {
                const dbUser = await User.findOne(query).select("role");
                if (dbUser?.role) role = dbUser.role;
            }
        }
    } catch (err) {
        console.error("proxy role DB lookup failed:", err);
    }

    const userRole = role?.toLowerCase(); // Case-insensitive comparison ke liye

    // 1. Admin & Admin API Protection
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
        if (userRole !== "admin") {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
    }

    // 2. Delivery Boy Protection (Makkhan chalega ab)
    if (pathname.startsWith("/delivery") || pathname.startsWith("/api/delivery")) {
        if (userRole !== "deliveryboy") {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
    }

    // 3. User Protection
    if (pathname.startsWith("/user")) {
        // Admin aur Delivery Boy ko user pages dekhne ki chhoot (Testing ke liye)
        const allowedRoles = ["user", "admin", "deliveryboy"];
        if (!allowedRoles.includes(userRole || "") && pathname !== "/user/delivered") {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api/user/stripe/webhook|api/socket/connect|api/socket/updatelocation|_next/static|_next/image|favicon.ico).*)',
    ],
};