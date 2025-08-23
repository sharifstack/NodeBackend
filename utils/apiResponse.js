class apiResponse {
  constructor(statusCode, message, data) {
    this.status = statusCode >= 200 && statusCode < 300 ? "OK" : "Client Error";
    this.statusCode = statusCode || 500;
    this.message = message || "Successful operation";
    this.data = data || null;
  }
  static sendsuccess(res, statusCode, message, data) {
    return res
      .status(statusCode)
      .json(new apiResponse(statusCode, message, data));
  }
}

module.exports = { apiResponse };
