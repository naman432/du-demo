const { Schema, model } = require("mongoose");

const PlanSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    features: {
      type: Array,
      required: true,
      default: [],
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Number,
      required: true,
      default: 0,
    },
    minutes: {
      type: Number,
      required: true,
      default: 0,
    },
    duration: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamp: {} },
  { collection: "Plan" },
);
const Plan = model("Plan", PlanSchema);
module.exports = Plan;
