const { Schema, model, Types } = require("mongoose");

const UsageSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    whatsapp: {
      type: Number,
      required: true,
      default: 0,
    },
    instagram: {
      type: Number,
      required: true,
      default: 0,
    },
    youtube: {
      type: Number,
      required: true,
      default: 0,
    },
    twitter: {
      type: Number,
      required: true,
      default: 0,
    },
    callMinutes: {
      type: Number,
      required: true,
      default: 0,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamp: {} },
  { collection: "Usage" },
);
const Usage = model("Usage", UsageSchema);
module.exports = Usage;
