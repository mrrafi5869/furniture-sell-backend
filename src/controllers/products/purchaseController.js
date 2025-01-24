const Cart = require("../../models/Cart");
const Purchase = require("../../models/Purchase");
const SSLCommerzPayment = require("sslcommerz-lts");
const ObjectId = require("mongoose").Types.ObjectId;

// SSLCommerz configuration
const store_id = "homew678f99ae66d1d"; // Replace with your actual store ID
const store_passwd = "homew678f99ae66d1d@ssl"; // Replace with your actual store password
const is_live = false; // Use `false` for sandbox, `true` for live

const placeOrder = async (req, res) => {
  const { guestId, userId, shippingAddress } = req.body;

  if (!shippingAddress || !shippingAddress.name) {
    return res
      .status(400)
      .json({ message: "Shipping address is missing or invalid." });
  }

  try {
    // Fetch cart based on guestId or userId
    const cart = await Cart.findOne(
      guestId ? { guestId } : { userId }
    ).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    // Check stock availability and prepare purchase items
    const purchaseItems = cart.items.map((item) => {
      if (item.product.stock < item.quantity) {
        throw new Error(
          `Product ${item.product.name} is out of stock for the requested quantity.`
        );
      }
      return {
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      };
    });

    // Generate a unique transaction ID
    const transactionId = new ObjectId().toString();

    // Prepare data for SSLCommerz
    const data = {
      total_amount: cart.totalPrice,
      currency: "BDT",
      tran_id: transactionId,
      success_url: `${process.env.BASE_URL}/purchase/payment/success`,
      fail_url: `${process.env.BASE_URL}/purchase/payment/fail`,
      cancel_url: `${process.env.BASE_URL}/purchase/payment/cancel`,
      ipn_url: `${process.env.BASE_URL}/purchase/payment/ipn`, // For asynchronous notifications
      shipping_method: "Courier",
      product_name: "Purchase Order",
      product_category: "General",
      product_profile: "general",
      cus_name: shippingAddress.name || "John Doe",
      cus_email: "guest@example.com", // Replace with actual user email if available
      cus_add1: shippingAddress.street || "123 Default Street",
      cus_city: shippingAddress.city || "Dhaka",
      cus_state: shippingAddress.state || "Dhaka Division",
      cus_postcode: shippingAddress.zipCode || "1000",
      cus_country: shippingAddress.country || "Bangladesh",
      cus_phone: shippingAddress.phone || "01700000000",
      ship_name: shippingAddress.name || "John Doe",
      ship_add1: shippingAddress.street || "123 Default Street",
      ship_city: shippingAddress.city || "Dhaka",
      ship_state: shippingAddress.state || "Dhaka Division",
      ship_postcode: shippingAddress.zipCode || "1000",
      ship_country: shippingAddress.country || "Bangladesh",
    };

    // Initialize payment using SSLCommerzPayment
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const response = await sslcz.init(data);

    if (response?.GatewayPageURL) {
      console.log("all right");
      // Save the order as "pending" before redirecting
      const purchase = new Purchase({
        userId,
        guestId,
        items: purchaseItems,
        totalPrice: cart.totalPrice,
        totalItems: cart.totalItems,
        shippingAddress: {
          name: "John Doe",
          street: "123 Default Street",
          city: "Dhaka",
          state: "Dhaka Division",
          zipCode: "1000",
          country: "Bangladesh",
          phone: "01700000000",
        },
        paymentStatus: "pending",
        status: "placed",
        transactionId,
      });
      await purchase.save();

      // Send the Gateway URL to the client for redirection
      return res.status(200).json({ url: response.GatewayPageURL });
    } else {
      return res.status(400).json({ message: "Failed to initiate payment." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Payment Success Controller
const paymentSuccess = async (req, res) => {
  const { tran_id } = req.body; // Transaction ID returned by SSLCommerz
  console.log(tran_id);

  try {
    const purchase = await Purchase.findOne({ transactionId: tran_id });

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found." });
    }

    // Update payment status to "completed"
    purchase.paymentStatus = "completed";
    await purchase.save();

    res.status(200).json({ message: "Payment successful.", purchase });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Payment Failure Controller
const paymentFail = async (req, res) => {
  const { tran_id } = req.body;

  try {
    const purchase = await Purchase.findOneAndDelete({
      transactionId: tran_id,
    });

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found." });
    }

    res
      .status(200)
      .json({ message: "Payment failed. Purchase deleted from database." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Payment Cancellation Controller
const paymentCancel = async (req, res) => {
  const { tran_id } = req.body;

  try {
    const purchase = await Purchase.findOneAndDelete({
      transactionId: tran_id,
    });

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found." });
    }

    res
      .status(200)
      .json({ message: "Payment cancelled. Purchase deleted from database." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get Purchase Details
const getPurchaseById = async (req, res) => {
  const { id } = req.params;

  try {
    const purchase = await Purchase.findById(id).populate("items.product");

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found." });
    }

    res.status(200).json(purchase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Update Purchase Status
const updatePurchaseStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const purchase = await Purchase.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found." });
    }

    res
      .status(200)
      .json({ message: "Purchase status updated successfully.", purchase });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Export Controller Functions
module.exports = {
  placeOrder,
  getPurchaseById,
  updatePurchaseStatus,
  paymentSuccess,
  paymentFail,
  paymentCancel,
};
