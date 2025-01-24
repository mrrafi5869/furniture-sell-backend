const mongoose = require("mongoose");
require("dotenv").config();
const colors = require("colors");

const connectDB = async () => {
  // set strict query to false
  mongoose.set("strict", false);

  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error(colors.red("📕", error));
  }
};

module.exports = connectDB;
