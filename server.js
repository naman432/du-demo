/* eslint-disable no-undef */
global.__basedir = __dirname;
const app = require("./App");
require("dotenv").config();
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

//DB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("connected to remote database"));
const port = 7000;
process.env.BASE_URL =
  "http://ec2-52-66-186-107.ap-south-1.compute.amazonaws.com:7000/";
app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});
