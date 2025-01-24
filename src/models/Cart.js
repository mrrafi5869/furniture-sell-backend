const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  guestId: { type: String, required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, default: 0 },
  totalItems: { type: Number, default: 0 },
});

module.exports = mongoose.model("Cart", cartSchema);
