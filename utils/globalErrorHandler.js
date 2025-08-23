const { is } = require("express/lib/request");

const developerError = (error, res) => {
  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({
    message: error.message,
    statusCode: error.statusCode,
    status: error.status,
    data: error.data,
    stack: error.stack,
    isOperationalError: error.isOperationalError,
  });
};

const productionError = (error, res) => {
  const statusCode = error.statusCode || 500;
  const isOperationalError = error.isOperationalError;
  if (isOperationalError) {
    return res.status(statusCode).json({
      message: error.message,
      statusCode: statusCode,
    });
  } else {
    return res.status(statusCode).json({
      message: "Internal server error",
      statusCode: statusCode,
    });
  }
};

exports.globalErrorHandler = (error, req, res, next) => {
  if (process.env.NODE_ENV == "development") {
    developerError(error, res);
  } else {
    productionError(error, res);
  }
};
