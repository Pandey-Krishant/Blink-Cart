import connectDB from "@/lib/db";
import Order from "@/modals/order.model";
import User from "@/modals/user.model";
import { NextResponse } from "next/server";

export async function POST(req: NextResponse) {
  try {
    await connectDB();
    const { userId, items, paymentMethod, address, totalAmount } =
      await req.json();
    if (
      !userId ||
      !items ||
      items.length === 0 ||
      !paymentMethod ||
      !address ||
      !totalAmount
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const newOrder = await Order.create({
      user: userId,
      items,
      paymentMethod,
      address,
      totalAmount,
    });
    return NextResponse.json(
      { message: "Order placed successfully", order: newOrder },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error placing order", error: (error as Error).message },
      { status: 500 },
    );
}
}
