const mongoose = require("mongoose");
const slugify = require("slugify");
const { customError } = require("../../utils/customError");

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    icon: {
      type: String,
      default: "subnet",
    },
    color: {
      type: String,
      default: "green",
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
subCategorySchema.pre("save", function (next) {
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
//-----update slug----//
subCategorySchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.name) {
    update.slug = slugify(update.name, {
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
subCategorySchema.pre("save", async function (next) {
  const slugExists = await this.constructor.findOne({ slug: this.slug });
  if (slugExists && slugExists._id.toString() !== this._id.toString()) {
    throw new customError(401, "SubCategory Name Already Exists");
  }
  next();
});

module.exports =
  mongoose.models.SubCategory ||
  mongoose.model("SubCategory", subCategorySchema);
