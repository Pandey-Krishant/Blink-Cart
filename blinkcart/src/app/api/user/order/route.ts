import connectDB from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import Order from "@/modals/order.model";
import User from "@/modals/user.model";
import { NextRequest, NextResponse } from "next/server";

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
    const { userId, items, paymentMethod, address, totalAmount, deliveryFee } =
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

    const safeAddress = await enrichAddressCoords(address);
    const newOrder = await Order.create({
      user: userId,
      items,
      paymentMethod,
      address: safeAddress,
      totalAmount,
      deliveryFee: Number(deliveryFee) || 0,
    });

    await emitEventHandler("new-Order", newOrder);
    
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
