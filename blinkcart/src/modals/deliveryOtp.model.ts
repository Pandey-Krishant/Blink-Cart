import mongoose from "mongoose";

export interface IDeliveryOtp {
  _id?: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  codeHash: string;
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const deliveryOtpSchema = new mongoose.Schema<IDeliveryOtp>(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

deliveryOtpSchema.index({ order: 1, createdAt: -1 });

const DeliveryOtp =
  mongoose.models.DeliveryOtp ||
  mongoose.model<IDeliveryOtp>("DeliveryOtp", deliveryOtpSchema);

export default DeliveryOtp;
