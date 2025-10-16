const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const { customError } = require("../../utils/customError");
const { validateWarranty } = require("../validation/warranty.validation");
const warrantyModel = require("../models/warranty.model");
const productModel = require("../models/product.model");


//create warranty

exports.createWarranty = asyncHandler(async (req, res) => {
    const warrantyData = await validateWarranty(req)


    const warranty = await warrantyModel.create({ ...warrantyData })
    if (!warranty) throw new customError(400, "warranty creation failed")


    //pushing warranty into product

    const updateProductInfo = await productModel.findOneAndUpdate(
        {
            _id: warrantyData.product
        },
        {
            $push: { warranty: warranty._id }
        },
        { new: true })

    if (!updateProductInfo) throw new customError(400, "update Failed")

    apiResponse.sendsuccess(res, 201, "warranty has been created", warranty)

})