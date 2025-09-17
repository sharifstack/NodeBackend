const QRCode = require("qrcode");
const { customError } = require("../../utils/customError");

exports.generateQR = async (text) => {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: "H",
      margin: 1,
    });
  } catch (err) {
    throw new customError(500, "Qrcode Generate Failed" + err);
  }
};
