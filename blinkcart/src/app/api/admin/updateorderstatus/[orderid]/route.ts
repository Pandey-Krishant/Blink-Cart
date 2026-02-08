import connectDB from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import DeliveryAssignment from "@/modals/deliveryAssignment.model";
import Order from "@/modals/order.model";
import User from "@/modals/user.model";
import { NextRequest, NextResponse } from "next/server";
//orderid vhi likhoo jis name se dynamic folder bnaya h..mene orderid se hi folder bnaya h
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderid: string }> },
) {
  try {
    await connectDB();
    const { orderid } = await params;
    const { status } = await req.json();
    const order = await Order.findById(orderid).populate("user");
    if (!order) {
      return NextResponse.json({ message: "order not found" }, { status: 400 });
    }
    order.status = status;

    type DeliveryBoyPayload = {
      id: string;
      name: string;
      mobile: string;
      latitude: number;
      longitude: number;
    };

    let deliveryBoysPayload: DeliveryBoyPayload[] = [];

    if ((status === "out for delivery" || status === "shipped") && !order.assignment) {
      const { latitude, longitude } = order.address || {};

      const lat = Number(latitude);
      const lng = Number(longitude);

      const allDeliveryBoys = await User.find({ role: "deliveryBoy" });

      const getAvailableIds = async (ids: any[]) => {
        if (ids.length === 0) return [];
        const busyIds = await DeliveryAssignment.find({
          assignedTo: { $in: ids }, // assigned delivery boys are busy
          status: { $nin: ["broadcasted", "completed"] },
        }).distinct("assignedTo");
        const busyIdset = new Set(busyIds.map((b) => String(b)));
        return ids.filter((id) => !busyIdset.has(String(id)));
      };

      let candidates: any[] = [];
      let chosenDeliveryBoys: any[] = [];

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        const nearByDeliveryboy = await User.find({
          role: "deliveryBoy",
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [lng, lat],
              },
              $maxDistance: 10000,
            },
          },
        });
        const nearByIds = nearByDeliveryboy.map((b) => b._id);
        const availableIds = await getAvailableIds(nearByIds);
        candidates = availableIds;
        chosenDeliveryBoys = nearByDeliveryboy.filter((b) =>
          availableIds.some((id) => String(id) === String(b._id)),
        );
      }

      // Fallback: if no nearby candidates or invalid coords, broadcast to all available delivery boys
      if (candidates.length === 0) {
        const allIds = allDeliveryBoys.map((b) => b._id);
        const availableIds = await getAvailableIds(allIds);
        candidates = availableIds;
        chosenDeliveryBoys = allDeliveryBoys.filter((b) =>
          availableIds.some((id) => String(id) === String(b._id)),
        );
      }

      if (candidates.length === 0) {
        await order.save();
        return NextResponse.json(
          { message: "there is no delivery boy found" },
          { status: 200 }
        );
      }

      const deliveryAssignment = await DeliveryAssignment.create({
        order: order._id,
        broadcastTo: candidates,
        status: "broadcasted",
      });
      order.assignment = deliveryAssignment._id;
      deliveryBoysPayload = chosenDeliveryBoys.map((b) => ({
        id: String(b._id),
        name: b.name,
        mobile: b.mobile,
        latitude: b.location?.coordinates?.[1],
        longitude: b.location?.coordinates?.[0],
      }));
      await deliveryAssignment.populate("order");
      await emitEventHandler("delivery-assignment-broadcasted", {
        assignmentId: String(deliveryAssignment._id),
        orderId: String(order._id),
        status: deliveryAssignment.status,
      });
    }
    await order.save();
    await order.populate("user");
    await emitEventHandler("order-status-updated", {
      orderId: String(order._id),
      status: order.status,
      order,
    });
    return NextResponse.json(
      {
        assignment: order.assignment?._id,
        availableBoys: deliveryBoysPayload,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: `update status error${error}`,
      },
      { status: 500 }
    );
  }
}
