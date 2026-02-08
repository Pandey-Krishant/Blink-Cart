import mongoose from "mongoose";

export interface IChatRoom {
  _id?: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  deliveryBoy: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const chatRoomSchema = new mongoose.Schema<IChatRoom>(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const ChatRoom =
  mongoose.models.ChatRoom || mongoose.model<IChatRoom>("ChatRoom", chatRoomSchema);

export default ChatRoom;
