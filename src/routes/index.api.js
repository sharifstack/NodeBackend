const express = require("express");
const upload = require("../middleware/multer.middleware");
const _ = express.Router();

_.use("/auth", require("./api/user.api"));
_.use("/category", require("./api/category.api"));
_.use("/subcategory", require("./api/subCategory.api"));
_.use("/brand", require("./api/brand.api"));
_.use("/discount", require("./api/discount.api"));
_.use("/product", require("./api/product.api"));
_.use("/coupon", require("./api/coupon.api"));
_.use("/warranty", require("./api/warranty.api"));
_.use("/reviews", require("./api/reviews.api"));

module.exports = _;
