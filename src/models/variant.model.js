const mongoose = require("mongoose");
const slugify = require("slugify");
const { customError } = require("../../utils/customError");

const variantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantName: {
      type: String,
      required: true,
      trim: true,
    },
    variantDescription: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    size: {
      type: String,
      default: "N/A",
    },
    color: {
      type: [String],
      default: [],
    },
    image: [
      {
        type: String,
      },
    ],
    stockVariant: {
      type: Number,
      default: 0,
    },
    alertVariantStock: {
      type: Number,
      default: 5,
    },
    retailPrice: {
      type: Number,
      required: true,
    },
    wholesalePrice: {
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

// ------- slug creation ------- //
variantSchema.pre("save", function (next) {
  if (this.isModified("variantName")) {
    this.slug = slugify(this.variantName, {
      replacement: "-",
      lower: true,
      strict: true,
      trim: true,
    });
  }
  next();
});

// ------- update slug on update ------- //
variantSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.variantName) {
    update.slug = slugify(update.variantName, {
      replacement: "-",
      lower: true,
      strict: true,
      trim: true,
    });
    this.setUpdate(update);
  }
  next();
});

// ------- ensure unique slug ------- //
variantSchema.pre("save", async function (next) {
  const slugExists = await this.constructor.findOne({ slug: this.slug });
  if (slugExists && slugExists._id.toString() !== this._id.toString()) {
    throw new customError(401, "Variant Name Already Exists");
  }
  next();
});

module.exports =
  mongoose.models.Variant || mongoose.model("Variant", variantSchema);
