import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/modals/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // 1. Body se data nikalo
    const { role, mobile } = await req.json();

    // 2. Check karo user logged in hai ya nahi
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized! Login karlo pehle bro." },
        { status: 401 }
      );
    }

    // 3. Database mein update karo
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { role, mobile },
      { new: true } // ðŸ”¥ Ye zaroori hai update ke baad wala data lene ke liye
    );

    // 4. Check if user exists
    if (!updatedUser) {
      return NextResponse.json(
        { message: "User nahi mila database mein!" },
        { status: 404 }
      );
    }

    // 5. Success Response
    return NextResponse.json(
      { 
        message: "Profile Updated Successfully! ðŸš€", 
        user: updatedUser 
      },
      { status: 200 }
    );

  } catch (error) {
    // console.log("Update Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error! ðŸ’¥" },
      { status: 500 }
    );
  }
}
