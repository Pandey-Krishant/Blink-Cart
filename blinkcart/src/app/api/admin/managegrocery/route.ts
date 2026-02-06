import connectDB from "@/lib/db";
import Order from "@/modals/order.model";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Saare orders find karne ke liye
        const orders = await Order.find({}).populate("user");

        return NextResponse.json(
            orders, 
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json(
            { message: `get orders error: ${error}` }, 
            { status: 500 }
        );
    }
}