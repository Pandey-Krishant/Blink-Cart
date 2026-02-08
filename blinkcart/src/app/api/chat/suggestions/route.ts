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

function normalizeSuggestions(raw: string) {
  if (!raw) return [];
  try {
    const jsonStart = raw.indexOf("[");
    const jsonEnd = raw.lastIndexOf("]");
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      const sliced = raw.slice(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(sliced);
      if (Array.isArray(parsed)) {
        return parsed.map((s) => String(s).trim()).filter(Boolean).slice(0, 4);
      }
    }
  } catch {
    // fall through
  }
  return raw
    .split("\n")
    .map((s) => s.replace(/^[-*\d.\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 4);
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
    const hint = String(body?.lastUserMessage || "").trim();

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ message: "invalid order id" }, { status: 400 });
    }

    const me = await User.findById(session.user.id).select("_id role name").lean();
    if ((me as any)?.role !== "deliveryBoy") {
      return NextResponse.json({ message: "forbidden" }, { status: 403 });
    }

    const order = await resolveOrder(orderId);
    if (!order) {
      return NextResponse.json({ message: "order not found" }, { status: 404 });
    }
    const assignedTo = order?.assignment?.assignedTo?._id
      ? String(order.assignment.assignedTo._id)
      : null;
    if (!assignedTo || assignedTo !== String(session.user.id)) {
      return NextResponse.json({ message: "forbidden" }, { status: 403 });
    }

    let room = await ChatRoom.findOne({ order: orderId });
    if (!room) {
      room = await ChatRoom.create({
        order: orderId,
        user: order?.user?._id,
        deliveryBoy: assignedTo,
      });
    }

    let latestUserMessage = hint;
    if (!latestUserMessage) {
      const last = await ChatMessage.findOne({
        room: room._id,
        senderRole: "user",
      })
        .sort({ createdAt: -1 })
        .lean();
      latestUserMessage = String(last?.text || "");
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { message: "Groq API key missing" },
        { status: 500 }
      );
    }

    const prompt = `You are a delivery partner assistant.Use emoji. Generate 3 short, full abusive   Hinglish (Hindi + English) reply suggestions (max 70 characters each).
Context from customer: "${latestUserMessage || "No recent message"}"
Return ONLY a JSON array of strings.`;

    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: 160,
      }),
    });
    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content || "";

    const suggestions = normalizeSuggestions(String(text));
    if (!suggestions.length) {
      return NextResponse.json({ suggestions: [] }, { status: 200 });
    }

    return NextResponse.json({ suggestions }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `suggestions error ${String(error)}` },
      { status: 500 }
    );
  }
}
