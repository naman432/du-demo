const { Schema, model, Types } = require("mongoose");

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    current_plan: {
      type: Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    data_used: {
      type: Number,
      required: true,
      default: 0,
    },
    minutes_used: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamp: {} },
  { collection: "User" },
);
const User = model("User", UserSchema);
module.exports = User;
