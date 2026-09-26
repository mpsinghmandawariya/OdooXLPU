const service = require("./stock.service");

// ======================================================
// GET STOCK
// ======================================================

const getStock = async (req, res, next) => {
  try {
    const result = await service.getStock({
      search: req.query.search,
      warehouseId: req.query.warehouseId,
      locationId: req.query.locationId,
      categoryId: req.query.categoryId,
      page: req.query.page,
      limit: req.query.limit,
    });

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET PRODUCT STOCK
// ======================================================

const getProductStock = async (req, res, next) => {
  try {
    const result = await service.getProductStock(req.params.productId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET LOCATION STOCK
// ======================================================

const getLocationStock = async (req, res, next) => {
  try {
    const result = await service.getLocationStock(req.params.locationId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStock,
  getProductStock,
  getLocationStock,
};
