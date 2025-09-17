const mongoose = require("mongoose");
const slugify = require("slugify");
const { customError } = require("../../utils/customError");

const reviewsSchema = new mongoose.Schema(
  {
    reviewerName: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    comment: {
      type: String,
    },
    rating: {
      type: Number,
    },
  },

  {
    timestamps: true,
  }
);

//-------checking is the slug already exist or not-------//
categorySchema.pre("save", async function (next) {
  const isWarehouseExists = await this.constructor.findOne({
    wareHousename: this.wareHousename,
  });
  if (
    isWarehouseExists &&
    isWarehouseExists._id.toString() !== this._id.toString()
  ) {
    throw new customError(401, "Warehouse Name Already Exists");
  }
  next();
});

module.exports =
  mongoose.models.Review ||
  mongoose.model("Review", reviewsSchema);
