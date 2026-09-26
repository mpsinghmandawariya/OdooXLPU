const deliveryService = require("./delivery.service");

const getDeliveries = async (req, res, next) => {
  try {
    const result = await deliveryService.getDeliveries(req.query);
    res
      .status(200)
      .json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
  } catch (error) {
    next(error);
  }
};

const getDeliveryById = async (req, res, next) => {
  try {
    const delivery = await deliveryService.getDeliveryById(req.params.id);
    res.status(200).json({ success: true, data: delivery });
  } catch (error) {
    next(error);
  }
};

const getNextReference = async (req, res, next) => {
  try {
    const referenceNumber = await deliveryService.getNextReference();
    res.status(200).json({ success: true, data: { referenceNumber } });
  } catch (error) {
    next(error);
  }
};

const createDelivery = async (req, res, next) => {
  try {
    const delivery = await deliveryService.createDelivery(
      req.validatedBody,
      req.user.id,
    );
    res
      .status(201)
      .json({
        success: true,
        message: "Delivery created successfully",
        data: delivery,
      });
  } catch (error) {
    next(error);
  }
};

const validateDelivery = async (req, res, next) => {
  try {
    const delivery = await deliveryService.validateDelivery(
      req.params.id,
      req.user.id,
    );
    res
      .status(200)
      .json({
        success: true,
        message: "Delivery validated and stock updated",
        data: delivery,
      });
  } catch (error) {
    next(error);
  }
};

const markDeliveryReady = async (req, res, next) => {
  try {
    const delivery = await deliveryService.markDeliveryReady(req.params.id);
    res
      .status(200)
      .json({
        success: true,
        message: "Delivery marked ready",
        data: delivery,
      });
  } catch (error) {
    next(error);
  }
};

const cancelDelivery = async (req, res, next) => {
  try {
    const delivery = await deliveryService.cancelDelivery(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Delivery cancelled", data: delivery });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDeliveries,
  getDeliveryById,
  getNextReference,
  createDelivery,
  validateDelivery,
  markDeliveryReady,
  cancelDelivery,
};
