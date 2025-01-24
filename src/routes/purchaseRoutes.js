const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getPurchaseById,
  updatePurchaseStatus,
  paymentSuccess,
  paymentFail,
  paymentCancel,
} = require("../controllers/products/purchaseController");

router.post("/purchase-product", placeOrder);
router.get("/:id", getPurchaseById);
router.patch("/:id", updatePurchaseStatus);

// for payment 
router.post("/payment/success", paymentSuccess);
router.post("/payment/fail", paymentFail);
router.post("/payment/cancel", paymentCancel);

module.exports = router;
