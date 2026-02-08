import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/modals/user.model";

export async function POST(req:NextRequest){
    try {
        await  connectDB()
        const {userId,socketId,isOnline}=await req.json()
        // console.log("[API] /api/socket/connect -> body:", {userId,socketId,isOnline})
        if(!userId){
            return NextResponse.json(
                {message:"missing user id"},
                {status:400}
            )
        }
        const update: { socketId?: string | null; isOnline?: boolean } = {}
        if (typeof socketId !== "undefined") update.socketId = socketId
        if (typeof isOnline === "boolean") update.isOnline = isOnline
        if (Object.keys(update).length === 0) {
            return NextResponse.json(
                {message:"missing update fields"},
                {status:400}
            )
        }
        const user=await User.findByIdAndUpdate(userId, update,{new:true})
        if(!user){
            return NextResponse.json(
            {message:"user not found"},
            {status:400}
        )
        }
        return NextResponse.json(
            {success:true},
            {status:200}
        )
    } catch (error) {
        console.error("[API] /api/socket/connect error:", error)
        return NextResponse.json(
            {success:false, error: String(error)},
            {status:500}
        )
    }
}
