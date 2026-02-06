import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/modals/user.model";

export async function POST(req:NextRequest){
    try {
        await  connectDB()
        const {userId,socketId}=await req.json()
        const user=await User.findByIdAndUpdate(userId,{
            socketId,
            isOnline:true
        },{new:true})
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
        return NextResponse.json(
            {success:false},
            {status:400}
        )
    }
}