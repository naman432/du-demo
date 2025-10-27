/* eslint-disable no-undef */
const express = require("express");
const compression = require("compression");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const userRoutes = require("./Routes/user");
app.use(express.json({ limit: "50mb" }));
//CORS Configuration
app.use(cors({
  // origin: ["http://ec2-52-66-186-107.ap-south-1.compute.amazonaws.com"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(compression());
app.use(express.urlencoded({ extended: true })); //for parsing body of HTML Forms
app.use(express.static("./public")); //for serving static contenct in public folder
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
//Logging
app.use(morgan("tiny"));
app.use(
  morgan("common", {
    stream: fs.createWriteStream(path.join(__dirname, "access.log"), {
      flags: "a",
    }),
  })
);
app.use(
  morgan("common", {
    skip: function (req, res) {
      return res.statusCode < 400;
    },
    stream: fs.createWriteStream(path.join(__dirname, "error.log"), {
      flags: "a",
    }),
  })
);
//Security Headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  })
);
//Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // limit each IP to 100 requests per window
  message: "Too many requests, please try again later.",
});
app.use("/api", limiter);

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());
//Data sanitization against XSS
app.use(xss());

//Disable x-powered-by header
app.disable("x-powered-by");

//Global Error Handling Middleware
// app.use((err, req, res) => {
//   console.error(err.stack);
//   res.status(500).json({
//     message: "Something went wrong!",
//   });
// });

//Routing
app.use("/api", userRoutes);

app.get("/", (req, res) => {
  console.log("Hello");
  res.status(200).send("Welcome");
});

module.exports = app;
