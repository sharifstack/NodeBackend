const BwipJs = require("bwip-js");

exports.barCodeGenerator = async (text) => {
  try {
    return BwipJs.toSVG({
      bcid: "code128",
      text: text,
      height: 12,
      includetext: true,
      textxalign: "center",
      textcolor: "000000",
    });
  } catch (error) {
    throw new customError(500, "BarCode Generate Failed" + error);
  }
};
