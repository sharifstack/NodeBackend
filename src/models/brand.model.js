const mongoose = require("mongoose");
const slugify = require("slugify");
const { customError } = require("../../utils/customError");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
    },
    image: {
      type: String,
      required: true,
    },
    since: {
      type: Number,
      required: true,
    },
    icon: {
      type: String,
      default: "accessibility",
    },
    color: {
      type: String,
      default: "orange",
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
brandSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      replacement: "-",
      remove: undefined,
      lower: false,
      strict: false,
      locale: "vi",
      trim: true,
    });
  }
  next();
});


//-------checking if the slug already exists-------//
brandSchema.pre("save", async function (next) {
  const slugExists = await this.constructor.findOne({ slug: this.slug });
  if (slugExists && slugExists._id.toString() !== this._id.toString()) {
    throw new customError(401, "Brand Name Already Exists");
  }
  next();
});

module.exports =
  mongoose.models.Brand || mongoose.model("Brand", brandSchema);
