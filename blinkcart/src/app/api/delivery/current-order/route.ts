import { auth } from "@/auth";
import connectDB from "@/lib/db";
import DeliveryAssignment from "@/modals/deliveryAssignment.model";
import Order from "@/modals/order.model";
import { NextResponse } from "next/server";

export async function GET(){
    try {
        await connectDB()
        const session=await auth()
        const deliveryBoyId= session?.user?.id
       const activeAssignment= await DeliveryAssignment.findOne({
        assignedTo:deliveryBoyId,
        status:"assigned"
       })
       .populate({
         path: "order",
         select: "address totalAmount items status createdAt",
       })
       .populate({
         path: "assignedTo",
         select: "name mobile location",
       })
       .lean()
       if(!activeAssignment){
        return NextResponse.json(
            {message:false},
            {status:200}
        )
       }
       return NextResponse.json(
        {message:true,assignment:activeAssignment},
        {status:200}
    )
    } catch (error) {
        return NextResponse.json(
            {message:`current ordere error ${error}`},
            {status:200}
        )
    }
}
