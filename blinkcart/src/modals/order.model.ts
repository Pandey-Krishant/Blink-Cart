import mongoose from "mongoose";

interface IOrder {
  user: mongoose.Types.ObjectId;
  items: {
    grocery: mongoose.Types.ObjectId;
    name: string;
    price: string;
    unit: string;
    image: string;
    quantity: number;
  }[];
  isPaid: boolean;
  totalAmount: number;
  paymentMethod: "cod" | "upi" | "card";
  address: {
    fullname: string;
    city: string;
    state: string;
    mobile: string;
    pincode: string;
    fullAddress: string;
    latitude: string;
    longitude: string;
  };
  status:
    | "pending"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "out for delivery";
}

const orderSchema = new mongoose.Schema<IOrder>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        grocery: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Grocery",
          required: true,
        },
        name: String,
        price: String,
        unit: String,
        image: String,
        quantity: Number,
      },
    ],
    paymentMethod: {
      type: String,
      enum: ["cod", "upi", "card"],
      default: "cod",
    },
    address: {
      fullname: String,
      city: String,
      state: String,
      mobile: String,
      pincode: String,
      fullAddress: String,
      latitude: String,
      longitude: String,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
        "out for delivery",
      ],
      default: "pending",
    },
    totalAmount: Number,
    isPaid: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Order =
  mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);

export default Order;
