import connectDB from "@/lib/db";
import User from "@/modals/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    try {
        await connectDB()
        const {userId,location}=await req.json()
        // console.log("[API] /api/socket/updatelocation -> body:", {userId, location})
        if(!userId || !location){
            return NextResponse.json(
                {message:"missing user id"},
                {status:400}
            )
        }
        const coords = location?.coordinates;
        const lng = Number(coords?.[0]);
        const lat = Number(coords?.[1]);
        if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) {
            return NextResponse.json(
                {message:"invalid coordinates"},
                {status:400}
            )
        }
        const user=await User.findByIdAndUpdate(userId,{location},{new:true})
        if(!user){
             return NextResponse.json(
                {message:"user not found"},
                {status:400}
            )
        }
         return NextResponse.json(
                {message:"location updated", location: user.location},
                {status:200}
            )
    } catch (error) {
        console.error("[API] /api/socket/updatelocation error:", error)
        return NextResponse.json(
                {message:`update location error ${String(error)}`},
                {status:500}
            )
    }
}
