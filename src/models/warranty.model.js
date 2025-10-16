const mongoose = require("mongoose");
const slugify = require("slugify");
const { customError } = require("../../utils/customError");

const warrantySchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    policy: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// -------- Generate slug from policy -------- //
warrantySchema.pre("save", function (next) {
  if (this.isModified("policy")) {
    this.slug = slugify(this.policy, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
  next();
});

// -------- Ensure unique slug -------- //
warrantySchema.pre("save", async function (next) {
  const existingSlug = await this.constructor.findOne({ slug: this.slug });
  if (existingSlug && existingSlug._id.toString() !== this._id.toString()) {
    throw new customError(401, "Warranty with this policy already exists");
  }
  next();
});

// -------- Update slug on update -------- //
warrantySchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.policy) {
    update.slug = slugify(update.policy, {
      lower: true,
      strict: true,
      trim: true,
    });
    this.setUpdate(update);
  }
  next();
});

module.exports =
  mongoose.models.Warranty || mongoose.model("Warranty", warrantySchema);
