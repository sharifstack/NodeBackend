const mongoose = require("mongoose");
const slugify = require("slugify");
const { customError } = require("../../utils/customError");

const deliverySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
    },
    amount: {
      type: Number,
      min: 0,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Generate slug before save
deliverySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      replacement: "-",
      lower: true,
      strict: false,
      trim: true,
    });
  }
  next();
});

deliverySchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.name) {
    update.slug = slugify(update.name, {
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

// Check unique slug
deliverySchema.pre("save", async function (next) {
  const slug = await this.constructor.findOne({ slug: this.slug });
  if (slug && slug._id.toString() !== this._id.toString()) {
    throw new customError(401, "Delivery name already exists");
  }
  next();
});

module.exports =
  mongoose.models.Delivery || mongoose.model("Delivery", deliverySchema);
