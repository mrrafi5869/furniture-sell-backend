const express = require("express");
const router = express.Router();

// Import your user routes here
const cartRoute = require("./cartRoutes");
const productRoute = require("./productRoutes");
const purchaseRoute = require("./purchaseRoutes");

// Define user routes
router.use("/cart", cartRoute);
router.use("/product", productRoute);
router.use("/purchase", purchaseRoute);

module.exports = router;
