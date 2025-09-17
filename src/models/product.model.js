const mongoose = require("mongoose");
const slugify = require("slugify");
const { customError } = require("../../utils/customError");
const { required } = require("joi");

const productSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
    },
    discount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discount",
    },
    image: [{}],
    tag: [
      {
        type: String,
        trim: true,
      },
    ],
    manufactureCountry: {
      type: String,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    warrantyInformation: {
      type: String,
    },
    warrantyClaim: {
      type: Boolean,
      default: true,
    },
    warrantyexpires: {
      type: Date,
    },
    availabilityStatus: {
      type: String,
      enum: ["In Stock", "Out Of Stock", "Pre-Order"],
      default: "In Stock",
    },
    shippingInformation: {
      type: String,
    },
    sku: {
      type: String,
      unique: true,
      required: true,
    },
    qrCode: {
      type: String,
    },
    barCode: {
      type: String,
    },
    groupUnit: {
      type: String,
      enum: ["Box", "Packet", "Dozen", "Custom"],
    },
    groupUnitQuantity: {
      type: Number,
      default: 1,
    },
    unit: {
      type: String,
      enum: ["Piece", "Kg", "Gram", "Custom"],
    },
    varientType: {
      type: String,
      enum: ["singleVarient", "multipleVarient"],
      default: "singleVarient",
      required: true,
    },
    size: {
      type: String,
      default: "N/A",
    },
    color: {
      type: String,
    },
    stock: {
      type: Number,
      default: 0,
    },
    warehouseLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WarehouseLocation",
    },
    retailPrice: {
      type: Number,
      required: true,
    },
    retailPriceProfitAmount: {
      type: Number,
      default: 0,
    },
    retailPriceProfitAmountPercentance: {
      type: Number,
      max: 100,
      default: 0,
    },
    wholesalePrice: {
      type: Number,
      required: true,
    },
    alertQuantity: {
      type: Number,
      default: 0,
    },
    stockQuantity: {
      type: Number,
      default: 0,
    },
    instock: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    minimumQuantity: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// ------- slug creation ------- //
productSchema.pre("save", function (next) {
  if (this.isModified("Name")) {
    this.slug = slugify(this.Name, {
      replacement: "-",
      remove: undefined,
      lower: true,
      strict: true,
      trim: true,
    });
  }
  next();
});

// ------- update slug on update ------- //
productSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.Name) {
    update.slug = slugify(update.Name, {
      replacement: "-",
      remove: undefined,
      lower: true,
      strict: true,
      trim: true,
    });
    this.setUpdate(update);
  }
  next();
});

// ------- ensure unique slug ------- //
productSchema.pre("save", async function (next) {
  const slugExists = await this.constructor.findOne({ slug: this.slug });
  if (slugExists && slugExists._id.toString() !== this._id.toString()) {
    throw new customError(401, "Product Name Already Exists");
  }
  next();
});

module.exports =
  mongoose.models.Product || mongoose.model("Product", productSchema);
