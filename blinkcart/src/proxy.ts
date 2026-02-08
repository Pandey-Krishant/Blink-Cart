import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/modals/user.model";

export default async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 1. "/" KO ADD KARNA COMPULSORY HAI BRO!
    const publicRoutes = [
  "/", 
  "/login", 
  "/register", 
  "/api/auth", 
  "/api/user/edit-role-mobile" // Isse add karo!
];

    // Use startsWith for API paths but exact match for home
    const isPublic = publicRoutes.some((path) => 
        path === "/" ? pathname === "/" : pathname.startsWith(path)
    );

    if (isPublic) {
        return NextResponse.next();
    }

    // 2. Secret check (Make sure NEXTAUTH_SECRET is in Vercel)
    const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET 
    });

    if (!token) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", req.url);
        return NextResponse.redirect(loginUrl);
    }

    // Role-based logic
    let role = (token as any).role;
    try {
        await connectDB();
        const dbUser = (token as any)?.email ? await User.findOne({ email: (token as any).email }).select("role") : null;
        if (dbUser?.role) role = dbUser.role;
    } catch (err) {
        console.error("proxy role DB lookup failed:", err);
    }

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