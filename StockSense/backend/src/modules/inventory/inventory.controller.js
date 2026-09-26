const service = require("./inventory.service");

const respond = (res, data, message) =>
  res.status(200).json({ success: true, message, data });

const createTransfer = async (req, res, next) => {
  try {
    const data = await service.createTransfer({
      ...req.validatedBody,
      userId: req.user.id,
    });
    res
      .status(201)
      .json({ success: true, message: "Transfer created successfully", data });
  } catch (error) {
    next(error);
  }
};

const createAdjustment = async (req, res, next) => {
  try {
    const data = await service.createAdjustment({
      ...req.validatedBody,
      userId: req.user.id,
    });
    res
      .status(201)
      .json({
        success: true,
        message: "Adjustment created successfully",
        data,
      });
  } catch (error) {
    next(error);
  }
};

const getTransfer = async (req, res, next) => {
  try {
    respond(res, await service.getOperation(req.params.id, "TRANSFER"));
  } catch (error) {
    next(error);
  }
};

const getAdjustment = async (req, res, next) => {
  try {
    respond(res, await service.getOperation(req.params.id, "ADJUSTMENT"));
  } catch (error) {
    next(error);
  }
};

const readyTransfer = async (req, res, next) => {
  try {
    respond(
      res,
      await service.markReady(req.params.id, "TRANSFER"),
      "Transfer marked ready",
    );
  } catch (error) {
    next(error);
  }
};

const readyAdjustment = async (req, res, next) => {
  try {
    respond(
      res,
      await service.markReady(req.params.id, "ADJUSTMENT"),
      "Adjustment marked ready",
    );
  } catch (error) {
    next(error);
  }
};

const validateTransfer = async (req, res, next) => {
  try {
    respond(
      res,
      await service.validateTransfer(req.params.id, req.user.id),
      "Transfer validated successfully",
    );
  } catch (error) {
    next(error);
  }
};

const validateAdjustment = async (req, res, next) => {
  try {
    respond(
      res,
      await service.validateAdjustment(req.params.id, req.user.id),
      "Adjustment validated successfully",
    );
  } catch (error) {
    next(error);
  }
};

const cancelTransfer = async (req, res, next) => {
  try {
    respond(
      res,
      await service.cancel(req.params.id, "TRANSFER"),
      "Transfer cancelled",
    );
  } catch (error) {
    next(error);
  }
};

const cancelAdjustment = async (req, res, next) => {
  try {
    respond(
      res,
      await service.cancel(req.params.id, "ADJUSTMENT"),
      "Adjustment cancelled",
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransfer,
  createAdjustment,
  getTransfer,
  getAdjustment,
  readyTransfer,
  readyAdjustment,
  validateTransfer,
  validateAdjustment,
  cancelTransfer,
  cancelAdjustment,
};
