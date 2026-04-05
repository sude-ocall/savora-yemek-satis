import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true
  },

  name: {
    type: String,
    required: true,
    trim: true
  },

  category: {
    type: String,
    required: true,
    trim: true
  },

  price: {
    type: Number,
    required: true
  },

  description: {
    type: String,
    default: ""
  },

  imgURL: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

export default mongoose.model("Product", productSchema);