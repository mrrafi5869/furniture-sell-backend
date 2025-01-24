const express = require("express");
const router = express.Router();
const {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  getCart,
} = require("../controllers/products/cartController");

// Cart routes
router.post("/add", addToCart); // Add product to cart
router.delete("/remove", removeFromCart); // Remove product from cart
router.put("/update", updateCartQuantity); // Update quantity of a product in the cart
router.delete("/clear", clearCart); // Clear the entire cart
router.get("/my-cart", getCart)

module.exports = router;
