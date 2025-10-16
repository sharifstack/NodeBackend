const mongoose = require("mongoose");
const slugify = require("slugify");
const { customError } = require("../../utils/customError");

const couponSchema = new mongoose.Schema(
  {
    couponCode: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    slug: {
      type: String,
      unique: true,
    },
    expireAt: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: 60,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    discountType: {
      type: String,
      enum: ["percentage", "tk"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

//-------slug-------//
couponSchema.pre("save", function (next) {
  if (this.isModified("couponCode")) {
    this.slug = slugify(this.couponCode, {
      replacement: "-",
      remove: undefined,
      lower: false,
      strict: false,
      trim: true,
    });
  }
  next();
});

//-----update slug----//
couponSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.couponCode) {
    update.slug = slugify(update.couponCode, {
      replacement: "-",
      remove: undefined,
      lower: true,
      strict: false,
      trim: true,
    });
    this.setUpdate(update);
  }
  next();
});

//-------checking if coupon code already exists-------//
couponSchema.pre("save", async function (next) {
  const existingCoupon = await this.constructor.findOne({
    couponCode: this.couponCode,
  });
  if (existingCoupon && existingCoupon._id.toString() !== this._id.toString()) {
    throw new customError(401, "Coupon Code Already Exists");
  }
  next();
});

//-------checking if slug already exists-------//
couponSchema.pre("save", async function (next) {
  const slugExists = await this.constructor.findOne({ slug: this.slug });
  if (slugExists && slugExists._id.toString() !== this._id.toString()) {
    throw new customError(401, "Coupon Name Already Exists");
  }
  next();
});

module.exports =
  mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
