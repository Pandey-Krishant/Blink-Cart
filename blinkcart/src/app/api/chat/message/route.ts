import { auth } from "@/auth";
import connectDB from "@/lib/db";
import ChatMessage from "@/modals/chatmessage.model";
import ChatRoom from "@/modals/chatroom.model";
import Order from "@/modals/order.model";
import User from "@/modals/user.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

async function resolveOrder(orderId: string) {
  const order = await Order.findById(orderId)
    .populate({
      path: "assignment",
      populate: { path: "assignedTo", select: "_id name role socketId" },
    })
    .populate({ path: "user", select: "_id name role socketId" })
    .lean();
  return order as any;
}

async function notifySocket(event: string, data: any, socketId?: string | null) {
  const base =
    process.env.NEXT_PUBLIC_SOCKET_SERVER || process.env.SOCKET_SERVER_URL;
  if (!base) return;
  try {
    await fetch(`${base}/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, data, socketId }),
    });
  } catch (err) {
    console.error("[chat] notify failed:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Login required" }, { status: 401 });
    }

    const body = await req.json();
    const orderId = String(body?.orderId || "");
    const text = String(body?.text || "").trim();

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ message: "invalid order id" }, { status: 400 });
    }
    if (!text) {
      return NextResponse.json({ message: "message required" }, { status: 400 });
    }

    const order = await resolveOrder(orderId);
    if (!order) {
      return NextResponse.json({ message: "order not found" }, { status: 404 });
    }
    const assignedTo = order?.assignment?.assignedTo?._id
      ? String(order.assignment.assignedTo._id)
      : null;
    const orderUserId = order?.user?._id ? String(order.user._id) : null;
    if (!assignedTo) {
      return NextResponse.json(
        { message: "delivery partner not assigned yet" },
        { status: 400 }
      );
    }

    const requesterId = String(session.user.id);
    const isUser = requesterId === orderUserId;
    const isDelivery = requesterId === assignedTo;
    if (!isUser && !isDelivery) {
      return NextResponse.json({ message: "forbidden" }, { status: 403 });
    }

    let room = await ChatRoom.findOne({ order: orderId });
    if (!room) {
      room = await ChatRoom.create({
        order: orderId,
        user: orderUserId,
        deliveryBoy: assignedTo,
      });
    }

    const me = await User.findById(requesterId).select("_id role name").lean();
    const senderRole = (me as any)?.role || (isDelivery ? "deliveryBoy" : "user");

    const message = await ChatMessage.create({
      room: room._id,
      sender: requesterId,
      senderRole,
      text,
    });

    const payload = {
      _id: message._id,
      room: String(room._id),
      sender: { _id: requesterId, name: (me as any)?.name, role: senderRole },
      senderRole,
      text,
      createdAt: message.createdAt,
    };

    const userSocketId = order?.user?.socketId || null;
    const deliverySocketId = order?.assignment?.assignedTo?.socketId || null;
    await Promise.all([
      notifySocket("chat-message", { orderId, message: payload }, userSocketId),
      notifySocket(
        "chat-message",
        { orderId, message: payload },
        deliverySocketId
      ),
    ]);

    return NextResponse.json({ message: payload }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `send message error ${String(error)}` },
      { status: 500 }
    );
  }
}
