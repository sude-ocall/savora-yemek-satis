import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
    taxNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    restaurantName: {
        type: String,
        required: true,
        trim: true
    },

    phone: {
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

    password: {
        type: String,
        required: true,
        minlength: 6
    },

    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        }
    ],

    incomingOrders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order"
        }
    ],

    completedOrders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order"
        }
    ]

}, {
    timestamps: true
});

export default mongoose.model("Seller", sellerSchema);