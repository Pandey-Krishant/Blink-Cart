import { NextRequest } from "next/server";
import Stripe from "stripe";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/modals/order.model";
import emitEventHandler from "@/lib/emitEventHandler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-01-28.clover",
})

export async function POST(req: NextRequest) {
    const sig = req.headers.get("stripe-signature")
    if (!sig) {
        return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
    }
    const rawBody = await req.text()
    let event;
    try {
        event = stripe.webhooks.constructEvent(
            rawBody, sig!, process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error) {
        console.error("signature verification failed", error)
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    if (event?.type === "checkout.session.completed") {
        const session = event.data.object
        await connectDB()
        const order = await Order.findByIdAndUpdate(
            session?.metadata?.orderId,
            { isPaid: true },
            { new: true }
        )
        if (order) {
            await emitEventHandler("new-Order", order)
        }
    }

    return NextResponse.json({ recieved: true }, { status: 200 })
}
