import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import mongoose from 'mongoose'

interface IGrocery {
  _id?: mongoose.Types.ObjectId;
  name: string;
  category: string;
  price: string;
  image: string;
  unit: string;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ICarSlice {
  cartData: IGrocery[] 
}

const initialState: ICarSlice = {
  cartData: []
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<IGrocery>) => {
    const existingItem = state.cartData.find(item => item._id == action.payload._id);
    if (existingItem) {
        // Agar pehle se hai toh quantity badhao (DevTools mein 1 hi row dikhegi index 0 par)
        existingItem.quantity += 1;
    } else {
        // Agar NAYA item hai (different ID), tabhi push hoga (DevTools mein index 1 banega)
        state.cartData.push(action.payload);
    }
},
    increment: (state, action: PayloadAction<mongoose.Types.ObjectId>) => {
      const item = state.cartData.find(i => i._id == action.payload)
      if (item) {
        item.quantity = item.quantity + 1
      }
    },
    // ðŸ”¥ Bas ye decrement add kiya hai bro
    decrement: (state, action: PayloadAction<mongoose.Types.ObjectId>) => {
      const item = state.cartData.find(i => i._id == action.payload)
      if (item) {
        if (item.quantity > 1) {
          item.quantity = item.quantity - 1
        } else {
          // Agar quantity 1 hai aur minus dabaya, toh cart se nikal do
          state.cartData = state.cartData.filter(i => i._id != action.payload)
        }
      }
    }
  }
})

export const { addToCart, increment, decrement } = cartSlice.actions
export default cartSlice.reducer
