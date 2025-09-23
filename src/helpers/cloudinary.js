const { customError } = require("../../utils/customError");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: "didxdfd04",
  api_key: "531153173522923",
  api_secret: "d-PLXlUdskrkUU_c5gdUlYZ12mA",
});

exports.uploadCloudinaryFIle = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      auto: "format",
      quality: "auto",
      fetch_format: "auto",
      resource_type: "image",
    });

    //Optimizing The Image
    const url = await cloudinary.url(result.public_id, {
      resource_type: "image",
    });
    fs.unlinkSync(filePath);
    return url;
  } catch (error) {
    console.log("Error From Cloudinary", error);
    throw new customError(400, error.message);
  }
};

//delete image from cloudinary

exports.deleteCloudinaryFile = async (publicId) => {
  try {
    const res = await cloudinary.uploader.destroy(publicId);
    return res.result;
  } catch (error) {
    console.log("Error from Cloudinary File Delete", error);
    throw new customError(400, error.message);
  }
};

//extracting public id

exports.PublicId = async (imgURl) => {
  const parts = imgURl.split("/");
  const cloudinaryPublicUrl = parts[parts.length - 1];
  return cloudinaryPublicUrl.split("?")[0];
};
