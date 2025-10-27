const { Schema, model, Types } = require("mongoose");

const DesignSchema = new Schema(
  {
    intent: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Top Hots", "Special Spots", "Sports Events"],
    },
    json: {
      type: Object,
      required: true,
      default: {},
    },
  },
  { timestamp: {} },
  { collection: "Design" },
);
const Design = model("Design", DesignSchema);
module.exports = Design;
