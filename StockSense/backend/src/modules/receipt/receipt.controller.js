const receiptService = require("./receipt.service");

const getReceipts = async (req, res, next) => {
  try {
    const result = await receiptService.getReceipts(req.query);
    res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) { next(error); }
};

const getReceiptById = async (req, res, next) => {
  try {
    const receipt = await receiptService.getReceiptById(req.params.id);
    res.status(200).json({ success: true, data: receipt });
  } catch (error) { next(error); }
};

const getNextReference = async (req, res, next) => {
  try {
    const referenceNumber = await receiptService.getNextReference();
    res.status(200).json({ success: true, data: { referenceNumber } });
  } catch (error) { next(error); }
};

const createReceipt = async (req, res, next) => {
  try {
    const receipt = await receiptService.createReceipt(req.validatedBody, req.user.id);
    res.status(201).json({ success: true, message: "Receipt created successfully", data: receipt });
  } catch (error) { next(error); }
};

const validateReceipt = async (req, res, next) => {
  try {
    const receipt = await receiptService.validateReceipt(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: "Receipt validated and stock updated", data: receipt });
  } catch (error) { next(error); }
};

const markReceiptReady = async (req, res, next) => {
  try {
    const receipt = await receiptService.markReceiptReady(req.params.id);
    res.status(200).json({ success: true, message: "Receipt marked ready", data: receipt });
  } catch (error) { next(error); }
};

const cancelReceipt = async (req, res, next) => {
  try {
    const receipt = await receiptService.cancelReceipt(req.params.id);
    res.status(200).json({ success: true, message: "Receipt cancelled", data: receipt });
  } catch (error) { next(error); }
};

module.exports = {
  getReceipts,
  getReceiptById,
  getNextReference,
  createReceipt,
  validateReceipt,
  markReceiptReady,
  cancelReceipt,
};
