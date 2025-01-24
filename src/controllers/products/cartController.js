const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const addToCart = async (req, res) => {
  try {
    const { guestId, productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ guestId });
    if (!cart) {
      cart = new Cart({ guestId, items: [], totalPrice: 0, totalItems: 0 });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    cart.totalPrice += product.price * quantity;
    cart.totalItems += quantity;

    await cart.save();

    if (!product.userAddedToCart.includes(guestId)) {
      product.userAddedToCart.push(guestId);
      await product.save();
    }

    res.status(200).json({
      message: "Product added to cart successfully",
      data: cart,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const removeFromCart = async (req, res) => {
  try {
    const { guestId, productId } = req.body;

    const cart = await Cart.findOne({ guestId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      const product = await Product.findById(productId);
      cart.totalPrice -= product.price * cart.items[itemIndex].quantity;
      cart.totalItems -= cart.items[itemIndex].quantity;

      cart.items.splice(itemIndex, 1);

      await cart.save();

      if (product.userAddedToCart.includes(guestId)) {
        product.userAddedToCart = product.userAddedToCart.filter(
          (id) => id !== guestId
        );
        await product.save();
      }

      res.status(200).json({
        message: "Product removed from cart successfully",
        data: cart,
      });
    } else {
      res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateCartQuantity = async (req, res) => {
  try {
    const { guestId, productId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ guestId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      const product = await Product.findById(productId);

      const diff = quantity - cart.items[itemIndex].quantity;
      cart.totalPrice += diff * product.price;
      cart.totalItems += diff;

      if (quantity === 0) {
        cart.items.splice(itemIndex, 1);

        if (product.userAddedToCart.includes(guestId)) {
          product.userAddedToCart = product.userAddedToCart.filter(
            (id) => id !== guestId
          );
          await product.save();
        }
      } else {
        cart.items[itemIndex].quantity = quantity;
      }

      await cart.save();

      res.status(200).json({
        message: "Cart updated successfully",
        data: cart,
      });
    } else {
      res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getCart = async (req, res) => {
  try {
    const { guestId } = req.query;
    const cart = await Cart.findOne({ guestId }).populate("items.product");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({
      message: "Cart retrieved successfully",
      data: cart,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const clearCart = async (req, res) => {
  try {
    const { guestId } = req.body;

    const cart = await Cart.findOneAndDelete({ guestId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  getCart,
};
