const express = require("express");
const { getQuery } = require("../Controllers/vector");
const { analyzeIntent } = require("../Controllers/intents");
const { getDesign } = require("../Controllers/plans");
const router = express.Router();

router.get("/getQuery", getQuery);
router.get("/analyzeIntent", analyzeIntent);
router.post("/getDesign", getDesign);

module.exports = router;
