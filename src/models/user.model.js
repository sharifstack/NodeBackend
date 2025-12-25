const jwt = require("jsonwebtoken");
const { type } = require("express/lib/response");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { Types, Schema } = mongoose;
const { customError } = require("../../utils/customError");
const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      trim: true,
      required: [true, "password is required"],
    },

    phoneNumber: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
      trim: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    PhoneNumberVerified: {
      type: Boolean,
      default: false,
    },

    role: {
      type: Types.ObjectId,
      ref: "Role",
    },

    permission: {
      type: Types.ObjectId,
      ref: "Permission",
    },

    address: {
      type: String,
      trim: true,
    },
    city: String,
    district: String,
    country: {
      type: String,
      default: "Bangladesh",
    },
    zipCode: {
      type: Number,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Others"],
    },

    cart: {
      type: Types.ObjectId,
      ref: "product",
    },

    wishlist: {
      type: Types.ObjectId,
      ref: "product",
    },

    cart: {
      type: Types.ObjectId,
      ref: "product",
    },

    newsLetterSubscribe: {
      type: Boolean,
      default: false,
    },
    resetPasswordOtp: Number,
    resetPasswordExpeires: Date,
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: false,
    },
    lastlogin: Date,
    lastlogout: Date,
    oauth: Boolean,
    refreshToken: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

//hasing password
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hashPass = await bcrypt.hash(this.password, 10);
    this.password = hashPass;
  }
  next();
});

//comaparing password
userSchema.methods.comparePassword = async function (humanPass) {
  return await bcrypt.compare(humanPass, this.password);
};

//generate access token
userSchema.methods.generateAccessToken = async function () {
  const accessToken = jwt.sign(
    {
      userid: this._id,
      email: this.email,
      name: this.name,
      role: this.role,
    },
    process.env.ACCESSTOKEN_SECRET,
    { expiresIn: process.env.ACCESSTOKEN_EXPIRES }
  );
  return accessToken;
};

//generate refresh token
userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      userid: this._id,
    },
    process.env.REFRESHTOKEN_SECRET,
    { expiresIn: process.env.REFRESHTOKEN_EXPIRES }
  );
};

//verify access token
userSchema.methods.verifyAccessToken = async function (token) {
  const isValidAccessToken = jwt.verify(
    token,
    process.env.ACCESSTOKEN_SECRET
  );
  if (!isValidAccessToken) {
    throw new customError(401, "Invalid Access Token");
  }
};

//verify refresh token
userSchema.methods.verifyRefreshToken = async function (token) {
  const isValidRefreshToken = jwt.verify(
    token,
    process.env.REFRESHTOKEN_SECRET
  );
  if (!isValidRefreshToken) {
    throw new customError(401, "Invalid Refresh Token");
  }
};

module.exports = mongoose.model("User", userSchema);
