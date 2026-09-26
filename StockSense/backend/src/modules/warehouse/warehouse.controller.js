const warehouseService = require("./warehouse.service");

const create = async (req, res, next) => {
  try {
    const warehouse = await warehouseService.createWarehouse(
      req.validatedBody || req.body,
    );

    res.status(201).json({
      success: true,
      message: "Warehouse created successfully",
      data: warehouse,
    });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const result = await warehouseService.getWarehouses({
      search: req.query.search,
      isActive: req.query.isActive,
      page: req.query.page,
      limit: req.query.limit,
    });

    res.status(200).json({
      success: true,
      data: result.warehouses,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const warehouse = await warehouseService.getWarehouseById(req.params.id);

    res.status(200).json({
      success: true,
      data: warehouse,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const warehouse = await warehouseService.updateWarehouse(
      req.params.id,
      req.validatedBody || req.body,
    );

    res.status(200).json({
      success: true,
      message: "Warehouse updated successfully",
      data: warehouse,
    });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await warehouseService.deleteWarehouse(req.params.id);

    res.status(200).json({
      success: true,
      message: "Warehouse deactivated successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getAll,
  getOne,
  update,
  remove,
};
