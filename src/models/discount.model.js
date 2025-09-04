const mongoose = require("mongoose");
const slugify = require("slugify");
const { customError } = require("../../utils/customError");

const discountSchema = new mongoose.Schema(
  {
    discountValidFrom: {
      type: Boolean,
      default: false,
    },
    discountValidTo: {
      type: Boolean,
      default: false,
    },
    discountName: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
    },
    discountValueByAmount: {
      type: Number,
      default: 0,
    },
    discountValueByPercentage: {
      type: Number,
      default: 0,
    },
    discountType: {
      type: String,
      enum: ["Tk", "percentage"],
      required: true,
    },
    discountTargetType: {
      type: String,
      enum: ["flat", "category", "product"],
      required: true,
    },
    targetProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    targetCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    targetSubCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
    },
    icon: {
      type: String,
      default: "disc",
    },
    color: {
      type: String,
      default: "navy",
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
discountSchema.pre("save", function (next) {
  if (this.isModified("discountName")) {
    this.slug = slugify(this.discountName, {
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
discountSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.discountName) {
    update.slug = slugify(update.discountName, {
      replacement: "-",
      remove: undefined,
      lower: false,
      strict: false,
      trim: true,
    });
    this.setUpdate(update);
  }
  next();
});

//-------checking if the slug already exists-------//
discountSchema.pre("save", async function (next) {
  const slugExists = await this.constructor.findOne({ slug: this.slug });
  if (slugExists && slugExists._id.toString() !== this._id.toString()) {
    throw new customError(401, "Discount Name Already Exists");
  }
  next();
});

module.exports =
  mongoose.models.Discount || mongoose.model("Discount", discountSchema);
