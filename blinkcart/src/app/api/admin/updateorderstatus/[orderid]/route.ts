import connectDB from "@/lib/db";
import DeliveryAssignment from "@/modals/deliveryAssignment.model";
import Order from "@/modals/order.model";
import User from "@/modals/user.model";
import { NextRequest, NextResponse } from "next/server";
//orderid vhi likhoo jis name se dynamic folder bnaya h..mene orderid se hi folder bnaya h
export async function POST(
  req: NextRequest,
  { params }: { params: { orderid: string } },
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

    if (status === "out for delivery" && !order.assignment) {
      const { latitude, longitude } = order.address || {};

      const lat = Number(latitude);
      const lng = Number(longitude);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        await order.save();
        return NextResponse.json(
          { message: "invalid address coordinates for this order" },
          { status: 400 }
        );
      }

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
      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds }, //ek ek kray id check kraygaa
        status: { $nin: ["broadcasted", "completed"] },
      }).distinct("assignedTo");
      const busyIdset = new Set(busyIds.map((b) => String(b)));
      const availableDeliveryBoy = nearByDeliveryboy.filter((b) =>
        !busyIdset.has(String(b._id)),
      );
      const candidates = availableDeliveryBoy.map((b) => b._id);
      if (candidates.length == 0) {
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
      deliveryBoysPayload = availableDeliveryBoy.map((b) => ({
        id: String(b._id),
        name: b.name,
        mobile: b.mobile,
        latitude: b.location.coordinates[1],
        longitude: b.location.coordinates[0],
      }));
      await deliveryAssignment.populate("order");
    }
    await order.save();
    await order.populate("user");
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
