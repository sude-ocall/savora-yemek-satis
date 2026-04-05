import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  menuRequest: {
    title: String,
    description: String,
    category: String
  },

  incomingOffers: [
    {
      restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller"
      },
      price: {
        type: Number,
        required: true
      },
      message: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  status: {
    type: String,
    enum: ["open", "closed"],
    default: "open"
  }

}, { timestamps: true });

export default mongoose.model("Offer", offerSchema);