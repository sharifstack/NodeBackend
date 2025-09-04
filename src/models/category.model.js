const mongoose = require("mongoose");
const slugify = require("slugify");
const { customError } = require("../../utils/customError");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
    },
    slug: {
      type: String,
    },
    subCategory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory",
      },
    ],
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

//-------slug-------//
categorySchema.pre("save", function (next) {
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

//-------checking is the slug already exist or not-------//
categorySchema.pre("save", async function (next) {
  const slug = await this.constructor.findOne({ slug: this.slug });
  if (slug && slug._id.toString() !== this._id.toString()) {
    throw new customError(401, "Category Name Already Exists");
  }
  next();
});

module.exports = mongoose.models.Category || mongoose.model("Category", categorySchema);
