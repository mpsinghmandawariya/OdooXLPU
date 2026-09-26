const express = require("express");

const controller = require("./move-history.controller");
const { authenticate } = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/", authenticate, controller.getHistory);

module.exports = router;
