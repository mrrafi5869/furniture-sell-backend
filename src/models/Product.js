const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "living_room",
        "bedroom",
        "dining_room",
        "office",
      ],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    dimensions: {
      height: { type: Number, required: true },
      width: { type: Number, required: true },
      depth: { type: Number, required: true },
      unit: { type: String, required: true, default: "cm" },
    },
    material: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: false,
    },
    images: {
      type: [String], // Array of image URLs
      required: true,
    },
    userAddedToCart: {
      type: [String], // Array of image URLs
      required: false,
    },
    ratings: {
      type: Number,
      required: false,
      min: 0,
      max: 5,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: String, // User's unique identifier (e.g., UUID or session-based ID)
          required: true,
        },
        userName: {
          type: String,
          required: true,
        },
        comment: {
          type: String,
          required: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      required: true,
      enum: ["available", "out_of_stock", "discontinued"],
      default: "available",
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
