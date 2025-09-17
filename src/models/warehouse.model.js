const mongoose = require("mongoose");
const slugify = require("slugify");
const { customError } = require("../../utils/customError");

const wareHouseSchema = new mongoose.Schema(
  {
    wareHousename: {
      type: String,
      required: [true, "warehouse name required."],
      trim: true,
    },
    wareHouseLocation: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

//-------checking is the slug already exist or not-------//
categorySchema.pre("save", async function (next) {
  const isWarehouseExists = await this.constructor.findOne({
    wareHousename: this.wareHousename,
  });
  if (
    isWarehouseExists &&
    isWarehouseExists._id.toString() !== this._id.toString()
  ) {
    throw new customError(401, "Warehouse Name Already Exists");
  }
  next();
});

module.exports =
  mongoose.models.warehouseLocation ||
  mongoose.model("warehouseLocation", wareHouseSchema);
