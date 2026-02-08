import { auth } from "@/auth";
import connectDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import DeliveryAssignment from "@/modals/deliveryAssignment.model";
import Order from "@/modals/order.model";
import User from "@/modals/user.model";
import emitEventHandler from "@/lib/emitEventHandler";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id: idFromParams } = await params;
    const idFromQuery = req.nextUrl.searchParams.get("id") || undefined;
    const segments = req.nextUrl.pathname.split("/").filter(Boolean);
    const assignmentIndex = segments.findIndex((s) => s === "assignment");
    const idFromPath =
      assignmentIndex >= 0 ? segments[assignmentIndex + 1] : undefined;
    const id = idFromParams || idFromPath || idFromQuery;
    if (!id) return NextResponse.json({ message: "Assignment id is required" }, { status: 400 });

    const session = await auth();
    const deliveryboyId = session?.user?.id;
    if (!deliveryboyId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const assignment = await DeliveryAssignment.findById(id);
    if (!assignment) return NextResponse.json({ message: "Assignment not found" }, { status: 404 });

    const isAssignedToMe =
      assignment.assignedTo && String(assignment.assignedTo) === String(deliveryboyId);
    const isInBroadcast =
      Array.isArray(assignment.broadcastTo) &&
      assignment.broadcastTo.some((id) => String(id) === String(deliveryboyId));

    // allow reject if it's assigned to me or currently broadcasted to me
    if (!isAssignedToMe && !isInBroadcast) {
      return NextResponse.json({ message: "You are not eligible to reject this assignment" }, { status: 403 });
    }

    if (isAssignedToMe) {
      // reset assignment to broadcasted so others can see it
      assignment.assignedTo = undefined as any;
      assignment.status = "broadcasted";
      assignment.acceptedAt = undefined as any;
    }

    // remove this delivery boy from broadcast list so it disappears for them
    if (Array.isArray(assignment.broadcastTo)) {
      assignment.broadcastTo = assignment.broadcastTo.filter(
        (id) => String(id) !== String(deliveryboyId)
      ) as any;
    }

    // if broadcastTo is empty, repopulate with available delivery boys (excluding this one)
    if (!Array.isArray(assignment.broadcastTo) || assignment.broadcastTo.length === 0) {
      const allDeliveryBoys = await User.find({ role: "deliveryBoy" }).select("_id");
      const allIds = allDeliveryBoys.map((b) => b._id);
      const busyIds = await DeliveryAssignment.find({ assignedTo: { $in: allIds }, status: { $nin: ["broadcasted", "completed"] } }).distinct("assignedTo");
      const busySet = new Set(busyIds.map((b) => String(b)));
      const available = allIds.filter(
        (id) => !busySet.has(String(id)) && String(id) !== String(deliveryboyId)
      );
      assignment.broadcastTo = available as any;
    }

    await assignment.save();

    // ensure order still references the assignment
    const order = await Order.findById(assignment.order);
    if (order) {
      order.assignment = assignment._id;
      await order.save();
    }

    await emitEventHandler("delivery-assignment-broadcasted", {
      assignmentId: String(assignment._id),
      orderId: String(assignment.order),
      status: assignment.status,
    });

    return NextResponse.json({ message: "Assignment rejected and re-broadcasted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `reject assignment error: ${error}` }, { status: 500 });
  }
}
