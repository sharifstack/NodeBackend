const mongoose = require("mongoose");
const slugify = require("slugify");
const { customError } = require("../../utils/customError");

const reviewsSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    comment: {
      type: String,
    },
    rating: {
      type: Number,
      max: [5, "max rating 5 "],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
    },
  },

  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Review || mongoose.model("Review", reviewsSchema);
