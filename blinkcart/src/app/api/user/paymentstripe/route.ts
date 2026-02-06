import connectDB from "@/lib/db";
import Order from "@/modals/order.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const {
      userId,
      items,
      paymentMethod,
      address,
      totalAmount,
    } = await req.json();

    if (!userId || !items?.length || !address || !totalAmount) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 🧾 CREATE ORDER FIRST
    const order = await Order.create({
      user: userId,
      items,
      paymentMethod,
      address,
      totalAmount,
      isPaid: false,
      status: "pending",
    });

    // 🟢 COD FLOW
    if (paymentMethod === "cod") {
      return NextResponse.json(
        { message: "COD Order Placed", orderId: order._id },
        { status: 201 }
      );
    }

    // 💳 STRIPE CARD FLOW
    const line_items = items.map((item: any) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: `${process.env.NEXT_BASE_URL}/user/sucess`,
      cancel_url: `${process.env.NEXT_BASE_URL}/user/cancel`,
      metadata: {
        orderId: order._id.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    return NextResponse.json(
      { message: "Payment failed", error: error.message },
      { status: 500 }
    );
  }
}
