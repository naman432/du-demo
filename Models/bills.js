const { Schema, model, Types } = require("mongoose");

const BillSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
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
  { collection: "Bill" },
);
const Bill = model("Bill", BillSchema);
module.exports = Bill;
