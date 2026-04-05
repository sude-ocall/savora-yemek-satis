import mongoose from "mongoose";

const creditCardSchema = new mongoose.Schema({
  cardHash: {
    type: String,
    required: true
  },
  last4: {
    type: String,
    required: true
  },
  expiryDate: {
    type: String,
    required: true
  }
}, { _id: false });

const addressSchema = new mongoose.Schema({
  title: {
    type: String,
    default: "",
    trim: true
  },
  addressLine: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  district: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  phone: {
    type: String,
    trim: true
  },

  password: {
    type: String,
    required: true,
    minlength: 6
  },

  creditCards: [creditCardSchema],

  addresses: [addressSchema],

  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order"
    }
  ],

}, {
  timestamps: true
});

export default mongoose.model("User", userSchema);