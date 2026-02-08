import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Grocery from "@/modals/grocery.model";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ message: "Grocery id is required" }, { status: 400 });
    }

    const body = await req.json();
    const update: Record<string, any> = {};
    if (body?.name) update.name = body.name;
    if (body?.category) update.category = body.category;
    if (body?.price !== undefined) update.price = String(body.price);
    if (body?.unit) update.unit = body.unit;
    if (body?.image) update.image = body.image;

    const updated = await Grocery.findByIdAndUpdate(id, update, { new: true });
    if (!updated) {
      return NextResponse.json({ message: "Grocery not found" }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Server Error", error: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ message: "Grocery id is required" }, { status: 400 });
    }

    const deleted = await Grocery.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "Grocery not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Server Error", error: error?.message },
      { status: 500 }
    );
  }
}
