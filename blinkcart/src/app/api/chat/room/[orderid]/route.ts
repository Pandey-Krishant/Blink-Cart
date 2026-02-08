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

export async function GET(
  req: NextRequest,
  context: { params?: { orderid?: string } }
) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Login required" }, { status: 401 });
    }

    let paramsObj: any = context?.params;
    if (paramsObj && typeof paramsObj.then === "function") {
      try {
        paramsObj = await paramsObj;
      } catch {
        paramsObj = undefined;
      }
    }
    const orderId =
      paramsObj?.orderid ||
      req.nextUrl?.pathname?.split("/")?.filter(Boolean)?.pop() ||
      "";

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ message: "invalid order id" }, { status: 400 });
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

    let room = await ChatRoom.findOne({ order: orderId }).lean();
    if (!room) {
      room = await ChatRoom.create({
        order: orderId,
        user: orderUserId,
        deliveryBoy: assignedTo,
      });
      room = room.toObject();
    } else {
      const needsUpdate =
        String(room.user) !== String(orderUserId) ||
        String(room.deliveryBoy) !== String(assignedTo);
      if (needsUpdate) {
        await ChatRoom.updateOne(
          { _id: room._id },
          { user: orderUserId, deliveryBoy: assignedTo }
        );
        room = { ...room, user: orderUserId, deliveryBoy: assignedTo };
      }
    }

    const messages = await ChatMessage.find({ room: room._id })
      .sort({ createdAt: 1 })
      .limit(60)
      .populate({ path: "sender", select: "_id name role" })
      .lean();

    const me = await User.findById(requesterId).select("_id role name").lean();

    return NextResponse.json(
      {
        room,
        me,
        messages,
        participants: {
          user: order.user,
          deliveryBoy: order.assignment?.assignedTo,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: `chat room error ${String(error)}` },
      { status: 500 }
    );
  }
}
