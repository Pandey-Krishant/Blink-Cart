import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Grocery from "@/modals/grocery.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const items = await Grocery.find({}).sort({ createdAt: -1 });
    return NextResponse.json(items, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Server Error", error: error?.message },
      { status: 500 }
    );
  }
}
