const service = require("./move-history.service");

const getHistory = async (req, res, next) => {
  try {
    const result = await service.getMoveHistory({
      search: req.query.search,
      productId: req.query.productId,
      warehouseId: req.query.warehouseId,
      moveType: req.query.moveType,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
      page: req.query.page,
      limit: req.query.limit,
    });

    res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

module.exports = { getHistory };
