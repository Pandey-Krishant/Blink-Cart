import { auth } from "@/auth";
import connectDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import DeliveryAssignment from "@/modals/deliveryAssignment.model";
import Order from "@/modals/order.model";
import emitEventHandler from "@/lib/emitEventHandler";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB()
        const idFromParams = params?.id
        const idFromQuery = req.nextUrl.searchParams.get("id") || undefined
        const segments = req.nextUrl.pathname.split("/").filter(Boolean)
        const assignmentIndex = segments.findIndex((s) => s === "assignment")
        const idFromPath =
            assignmentIndex >= 0 ? segments[assignmentIndex + 1] : undefined
        const id = idFromParams || idFromPath || idFromQuery
        if (!id) {
            return NextResponse.json({ message: "Assignment id is required" }, { status: 400 })
        }
        const session=await auth()
        const deliveryboyId=session?.user?.id
        if(!deliveryboyId){
            return NextResponse.json({message:"Unauthorized"},{status:401})

        }
        const assignment=await DeliveryAssignment.findById(id)
        if(!assignment){
            return NextResponse.json({message:"Assignment not found"},{status:404})

        }
        if(assignment.status!=="broadcasted"){
            return NextResponse.json({message:"Assignment not broadcasted"},{status:400})
        }
        const alreadyasssigned = await DeliveryAssignment.findOne({assignedTo:deliveryboyId,status:{$nin:["completed","broadcasted"]}})
        if(alreadyasssigned){
            return NextResponse.json({message:"You are already assigned to another assignment"},{status:400})
        }
      
        assignment.assignedTo=deliveryboyId
        assignment.status="assigned"
        assignment.acceptedAt=new Date()
        await assignment.save()

        const order=await Order.findById(assignment.order)
        if(!order){
            return NextResponse.json({message:"Order not found"},{status:404})
        }
        
        order.assignment = assignment._id
        await order.save()

        await assignment.populate({
            path: "assignedTo",
            select: "name mobile"
        })

        await DeliveryAssignment.updateMany(
            {
                _id:{$ne:assignment._id},
            broadcastTo:deliveryboyId,
            status:"broadcasted"
        
        },{
            $pull:{broadcastTo:deliveryboyId}
        })

        await emitEventHandler("delivery-assignment-accepted", {
            orderId: String(order._id),
            assignmentId: String(assignment._id),
            status: assignment.status,
            assignedTo: assignment.assignedTo
                ? {
                    _id: String((assignment.assignedTo as any)._id),
                    name: (assignment.assignedTo as any).name,
                    mobile: (assignment.assignedTo as any).mobile,
                }
                : null,
        })

        return NextResponse.json(
           {message:"order accepted successfully"},
            {
                status:200
            } 
        )
    } catch (error) {
        
        return NextResponse.json(
            {message:`accept assignment error${error}`},
             {
                 status:400
             } 
         )
    }
}

