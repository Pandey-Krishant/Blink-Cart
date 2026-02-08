import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDB from "@/lib/db";
import Grocery from "@/modals/grocery.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const price = formData.get("price") as string;
    const unit = formData.get("unit") as string;
    const file = formData.get("image") as File | null;

    if (!name || !price || !category) {
      return NextResponse.json({ message: "Missing fields, bro!" }, { status: 400 });
    }

    let imageUrl = "";
    if (file && file.size > 0) {
      const uploadedUrl = await uploadOnCloudinary(file);
      imageUrl = uploadedUrl || "";
    }

    const newGrocery = await Grocery.create({
      name,
      category,
      price: price, // Schema mein String hai toh string hi bhejo
      unit,
      image: imageUrl,
    });

    // âœ… Hamesha object return karo
    return NextResponse.json({ 
      success: true, 
      message: "Grocery added successfully ðŸ”¥", 
      data: newGrocery 
    }, { status: 201 });

  } catch (error: any) {
    console.error("API Error:", error);
    // âŒ Yahan galti ho rahi hogi, error.message ko JSON mein lapet kar bhejo
    return NextResponse.json({ 
      success: false, 
      message: "Server Error", 
      error: error.message 
    }, { status: 500 });
  }
}
