import { auth } from "@/auth";
import connectDB from "@/lib/db";
import DeliveryAssignment from "@/modals/deliveryAssignment.model";
import DeliveryOtp from "@/modals/deliveryOtp.model";
import Order from "@/modals/order.model";
import crypto from "crypto";
import nodemailer from "nodemailer";
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

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ message: "orderId required" }, { status: 400 });
    }

    const assignment = await DeliveryAssignment.findOne({
      order: orderId,
      assignedTo: session.user.id,
      status: "assigned",
    }).lean();
    if (!assignment) {
      return NextResponse.json({ message: "forbidden" }, { status: 403 });
    }

    const order = await Order.findById(orderId).populate("user").lean();
    if (!order) {
      return NextResponse.json({ message: "order not found" }, { status: 404 });
    }
    const userEmail = (order as any)?.user?.email;
    if (!userEmail) {
      return NextResponse.json(
        { message: "user email missing" },
        { status: 400 }
      );
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM;

    if (!smtpHost || !smtpUser || !smtpPass || !smtpFrom) {
      return NextResponse.json(
        { message: "SMTP config missing" },
        { status: 500 }
      );
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await DeliveryOtp.deleteMany({ order: orderId });
    await DeliveryOtp.create({
      order: orderId,
      codeHash: hashOtp(otp),
      expiresAt,
    });

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const shortId = String(order?._id || "").slice(-6).toUpperCase();
    await transporter.sendMail({
      from: smtpFrom,
      to: userEmail,
      subject: `Delivery OTP for Order #${shortId}`,
      text: `Your delivery OTP is ${otp}. It expires in 10 minutes.`,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `request otp error ${String(error)}` },
      { status: 500 }
    );
  }
}
