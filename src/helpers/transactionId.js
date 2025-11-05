const crypto = require("crypto");

exports.getTransactionId = () => {
  const value = crypto.randomUUID();
  const parts = value.split("-");
  return parts[parts.length - 1];
};
