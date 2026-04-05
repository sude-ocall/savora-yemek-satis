import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true
  },

  menu: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: false
      },
      quantity: {
        type: Number,
        default: 1
      }
    }
  ],

  status: {
    type: String,
    enum: ["new", "preparing", "on_the_way", "completed", "cancelled"],
    default: "new"
  },

  note: {
    type: String,
    default: ""
  }

}, {
  timestamps: true
});

export default mongoose.model("Order", orderSchema);