import connectDB from "@/lib/db";
import Order from "@/modals/order.model";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Show COD orders immediately, and only show online orders after payment success
        const orders = await Order.find({
            $or: [
                { paymentMethod: "cod" },
                { isPaid: true }
            ]
        })
        .populate("user")
        .populate({
            path: "assignment",
            populate: {
                path: "assignedTo",
                select: "name mobile"
            }
        });

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
