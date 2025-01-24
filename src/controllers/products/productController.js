const Product = require("../../models/Product");

// Add a new product
const addProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({
      message: "Product added successfully",
      data: product,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      message: "Product get successfully",
      data: products,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get a single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({
      message: "Product fetched successfully",
      data: product,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update product details
const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Add a review to a product
// Add a review to a product
const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { user, userName, comment } = req.body;

    if (!user || !userName) {
      return res.status(400).json({ error: "User and userName are required" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = {
      user,
      userName,
      comment,
      createdAt: new Date(),
    };

    product.reviews.push(review);
    await product.save();

    res.status(200).json({
      message: "Review added successfully",
      data: product,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update product rating
const updateRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { ratings } = req.body;

    if (ratings < 0 || ratings > 5) {
      return res.status(400).json({ error: "Invalid rating value" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.ratings = ratings;
    await product.save();

    res.status(200).json({
      message: "Product rating updated successfully",
      data: product,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addReview,
  updateRating,
};
