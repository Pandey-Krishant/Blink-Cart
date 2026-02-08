import connectDB from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import Order from "@/modals/order.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

async function enrichAddressCoords(address: any) {
  if (!address) return address;
  const lat = Number(address.latitude);
  const lng = Number(address.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0)) {
    return address;
  }
  const query = [address.fullAddress, address.city, address.pincode]
    .filter(Boolean)
    .join(", ");
  if (!query) return address;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();
    const first = Array.isArray(data) ? data[0] : null;
    const nLat = Number(first?.lat);
    const nLng = Number(first?.lon);
    if (Number.isFinite(nLat) && Number.isFinite(nLng)) {
      return { ...address, latitude: String(nLat), longitude: String(nLng) };
    }
  } catch (err) {
    console.error("Geocode error:", err);
  }
  return address;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const {
      userId,
      items,
      paymentMethod,
      address,
      totalAmount,
      deliveryFee,
    } = await req.json();

    if (!userId || !items?.length || !address || !totalAmount) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // ðŸ§¾ CREATE ORDER FIRST
    const safeAddress = await enrichAddressCoords(address);
    const order = await Order.create({
      user: userId,
      items,
      paymentMethod,
      address: safeAddress,
      totalAmount,
      deliveryFee: Number(deliveryFee) || 0,
      isPaid: false,
      status: "pending",
    });

    // ðŸŸ¢ COD FLOW
    if (paymentMethod === "cod") {
      await emitEventHandler("new-Order", order);
      return NextResponse.json(
        { message: "COD Order Placed", orderId: order._id },
        { status: 201 }
      );
    }

    // ðŸ’³ STRIPE CARD FLOW
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
