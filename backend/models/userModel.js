const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      //  required: true,
    },
    refreshToken: {
      type: String,
    },
    phone: {
      type: String,
      // required: true,
    },
    image: {
      type: [String],
      default: []
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isExist: {
      type: Boolean,
      default: true,
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      required: false
    },
    address: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
      }
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;