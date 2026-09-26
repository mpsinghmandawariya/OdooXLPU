const warehouseService = require("./warehouse.service");

const getWarehouses = async (req, res, next) => {
  try {
    const warehouses = await warehouseService.getWarehouses(req.query);

    res.status(200).json({
      success: true,
      message: "Warehouses fetched successfully",
      data: warehouses,
    });
  } catch (error) {
    next(error);
  }
};

const getWarehouseById = async (req, res, next) => {
  try {
    const warehouse = await warehouseService.getWarehouseById(req.params.id);

    res.status(200).json({
      success: true,
      message: "Warehouse fetched successfully",
      data: warehouse,
    });
  } catch (error) {
    next(error);
  }
};

const createWarehouse = async (req, res, next) => {
  try {
    const warehouse = await warehouseService.createWarehouse(req.validatedBody);

    res.status(201).json({
      success: true,
      message: "Warehouse created successfully",
      data: warehouse,
    });
  } catch (error) {
    next(error);
  }
};

const updateWarehouse = async (req, res, next) => {
  try {
    const warehouse = await warehouseService.updateWarehouse(
      req.params.id,
      req.validatedBody,
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

const deleteWarehouse = async (req, res, next) => {
  try {
    const warehouse = await warehouseService.deleteWarehouse(req.params.id);

    res.status(200).json({
      success: true,
      message: "Warehouse deleted successfully",
      data: warehouse,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
};
