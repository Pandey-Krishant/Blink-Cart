import { auth } from "@/auth";
import connectDB from "@/lib/db";
import DeliveryAssignment from "@/modals/deliveryAssignment.model";
import User from "@/modals/user.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user?.email && !session?.user?.id) {
      return NextResponse.json(
        { message: "user is not authorized" },
        { status: 401 }
      );
    }
    let userId = session.user.id;
    if (!userId && session.user.email) {
      const user = await User.findOne({ email: session.user.email }).select(
        "_id"
      );
      userId = user?._id?.toString();
    }
    if (!userId) {
      return NextResponse.json({ message: "user is not found" }, { status: 404 });
    }

    const assignments = await DeliveryAssignment.find({
      assignedTo: userId,
      status: "completed",
    })
      .populate("order")
      .lean();

    return NextResponse.json(assignments, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `get completed assignments error: ${error}` },
      { status: 500 }
    );
  }
}
