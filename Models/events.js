const { Schema, model } = require("mongoose");

const EventSchema = new Schema(
  {
    advance_pay: {
      type: Number,
      required: true,
      default: 0,
    },
    title: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: false,
    },
    guests: {
      type: Array,
      required: true,
      default: [],
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Entertainment", "Sports"],
    },
    dateString: {
      type: String,
      required: false,
    },
  },
  { timestamp: {} },
  { collection: "Event" },
);
const Event = model("Event", EventSchema);
module.exports = Event;
