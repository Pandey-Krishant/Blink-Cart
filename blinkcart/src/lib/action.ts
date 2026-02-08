"use server";
import connectDB from "@/lib/db";
import Grocery from "@/modals/grocery.model";
import { revalidatePath } from "next/cache";

export async function addGroceryToDB(formData: any) {
  try {
    await connectDB();
    
    // Database mein save ho raha hai
    const newItem = await Grocery.create(formData);
    
    // Page refresh karne ke liye taaki naya data dikhe
    revalidatePath("/");
    
    return { success: true, message: "Item added successfully!" };
  } catch (error) {
    console.error("DB Error:", error);
    return { success: false, message: "Failed to add item." };
  }
}
