import mongoose from "mongoose";

interface IGrocery {
  _id?: mongoose.Types.ObjectId;
  name: string;
  category: string;
  price: string;
  image: string;
  unit: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const groceryschema = new mongoose.Schema<IGrocery>(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Fruits & Vegetables",
        "Dairy, Bread & Eggs",
        "Snacks & Munchies",
        "Cold Drinks & Juices",
        "Instant & Frozen Food",
        "Tea, Coffee & Health Drinks",
        "Bakery & Biscuits",
        "Sweet Tooth (Chocolates & Ice Cream)",
        "Chicken, Meat & Fish",
        "Cleaning & Household Essentials",
      ],
      required:true
    },
    price:{
        type:String,
        required:true
    },
      unit:{
        type:String,
        required:true
    },
      image:{
        type:String,
        required:true
    }
  },
  { timestamps: true },
);


const Grocery = mongoose.models.Grocery || mongoose.model<IGrocery>("Grocery", groceryschema);
export default Grocery;
