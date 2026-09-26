const express = require("express");

const controller = require("./stock.controller");
const { authenticate } = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/", authenticate, controller.getStock);
router.get("/product/:productId", authenticate, controller.getProductStock);
router.get("/location/:locationId", authenticate, controller.getLocationStock);

module.exports = router;
