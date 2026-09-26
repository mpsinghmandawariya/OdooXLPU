const service = require("./reordering.service");

const getRules = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: await service.getRules({
        productId: req.query.productId,
        warehouseId: req.query.warehouseId,
        locationId: req.query.locationId,
        isActive:
          req.query.isActive === undefined
            ? true
            : req.query.isActive === "true",
      }),
    });
  } catch (error) {
    next(error);
  }
};
const getRule = async (req, res, next) => {
  try {
    res.json({ success: true, data: await service.getRuleById(req.params.id) });
  } catch (error) {
    next(error);
  }
};
const createRule = async (req, res, next) => {
  try {
    res
      .status(201)
      .json({
        success: true,
        data: await service.createRule(req.validatedBody),
        message: "Reordering rule created successfully",
      });
  } catch (error) {
    next(error);
  }
};
const updateRule = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: await service.updateRule(req.params.id, req.validatedBody),
      message: "Reordering rule updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
const deactivateRule = async (req, res, next) => {
  try {
    await service.deactivateRule(req.params.id);
    res.json({
      success: true,
      message: "Reordering rule deactivated successfully",
    });
  } catch (error) {
    next(error);
  }
};
module.exports = { getRules, getRule, createRule, updateRule, deactivateRule };
