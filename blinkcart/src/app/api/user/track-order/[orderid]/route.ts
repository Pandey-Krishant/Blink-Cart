import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Order from "@/modals/order.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ orderid: string }> }
) {
  try {
    await connectDb();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Login required" }, { status: 401 });
    }

    let paramsObj: any = await context.params;

    const orderId =
      paramsObj?.orderid ||
      req.nextUrl?.pathname?.split("/")?.filter(Boolean)?.pop() ||
      req.nextUrl?.searchParams?.get("orderid") ||
      "";
    if (!orderId) {
      return NextResponse.json({ message: "order id required" }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ message: "invalid order id" }, { status: 400 });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: session.user.id,
    })
      .populate({
        path: "assignment",
        populate: { path: "assignedTo", select: "name mobile location" },
      })
      .lean();

    if (!order) {
      return NextResponse.json({ message: "order not found" }, { status: 404 });
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `track order error ${String(error)}` },
      { status: 500 }
    );
  }
}
