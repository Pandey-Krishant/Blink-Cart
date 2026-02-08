import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Order from "@/modals/order.model"; // Check karlo 'modals' hai ya 'models'
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Login required bro!" }, { status: 401 });
        }

        // ðŸŸ¢ FIX: findOne ki jagah find() use karo taaki Array mile
        const orders = await Order.find({
            user: session.user.id,
            $or: [
                { paymentMethod: "cod" },
                { isPaid: true }
            ]
        })
            .populate("user")
            .populate({
                path: "assignment",
                populate: { path: "assignedTo", select: "name mobile" },
            })
            .sort({ createdAt: -1 }); // Naye orders pehle dikhenge
        
        if (!orders || orders.length === 0) {
            return NextResponse.json([], { status: 200 }); // Empty array bhejo agar order nahi hai
        }
        
        return NextResponse.json(orders, { status: 200 });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ message: `get all orders error ${error}` }, { status: 400 });
    }
}
