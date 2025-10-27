const { Schema, model, Types } = require("mongoose");

const SpotsSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Top", "VIP", "Secret"],
    },
    images: {
      type: Array,
      required: true,
      default: [],
    },
    date: {
      type: Date,
      required: true,
    },
    dateString: {
      type: String,
      required: false,
    },
  },
  { timestamp: {} },
  { collection: "Spots" },
);
const Spots = model("Spots", SpotsSchema);
module.exports = Spots;
