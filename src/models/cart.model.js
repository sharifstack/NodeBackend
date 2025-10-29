const { type } = require("express/lib/response");
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    guestId: {
      type: String,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        variant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Variant",
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        totalPrice: {
          type: Number,
          required: true,
        },

        size: {
          type: String,
          trim: true,
          required: true,
        },
        color: {
          type: String,
          default: "brown",
        },
      },
    ],
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    totalproduct: {
      type: Number,
    },
    discountAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    discountType: {
      type: String,
    },
    totalProducts: {
      type: Number,
      default: 0,
    },
    totalAmountOfWholeProduct: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate totalAmountOfWholeProduct before saving
cartSchema.pre("save", function (next) {
  if (this.items && this.items.length > 0) {
    this.totalAmountOfWholeProduct = this.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );
  } else {
    this.totalAmountOfWholeProduct = 0;
  }
  next();
});

module.exports = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
