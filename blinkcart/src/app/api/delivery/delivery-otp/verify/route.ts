import { auth } from "@/auth";
import connectDB from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import DeliveryAssignment from "@/modals/deliveryAssignment.model";
import DeliveryOtp from "@/modals/deliveryOtp.model";
import Order from "@/modals/order.model";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

function hashOtp(otp: string) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Login required" }, { status: 401 });
    }

    const { orderId, otp } = await req.json();
    if (!orderId || !otp) {
      return NextResponse.json(
        { message: "orderId and otp required" },
        { status: 400 }
      );
    }

    const assignment = await DeliveryAssignment.findOne({
      order: orderId,
      assignedTo: session.user.id,
      status: "assigned",
    });
    if (!assignment) {
      return NextResponse.json({ message: "forbidden" }, { status: 403 });
    }

    const latest = await DeliveryOtp.findOne({ order: orderId })
      .sort({ createdAt: -1 })
      .lean();
    if (!latest) {
      return NextResponse.json({ message: "otp not found" }, { status: 400 });
    }
    if (latest.usedAt) {
      return NextResponse.json({ message: "otp already used" }, { status: 400 });
    }
    if (latest.expiresAt && new Date(latest.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ message: "otp expired" }, { status: 400 });
    }

    const match = hashOtp(String(otp).trim()) === latest.codeHash;
    if (!match) {
      return NextResponse.json({ message: "invalid otp" }, { status: 400 });
    }

    await DeliveryOtp.updateOne({ _id: latest._id }, { usedAt: new Date() });
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: "delivered" },
      { new: true }
    );
    assignment.status = "completed";
    await assignment.save();

    if (order) {
      await order.populate("user");
      await emitEventHandler("order-status-updated", {
        orderId: String(order._id),
        status: order.status,
        order,
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `verify otp error ${String(error)}` },
      { status: 500 }
    );
  }
}
