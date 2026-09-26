const locationService = require("./location.service");

const create = async (req, res, next) => {
  try {
    const location = await locationService.createLocation(
      req.validatedBody || req.body,
    );

    res.status(201).json({
      success: true,
      message: "Location created successfully",
      data: location,
    });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const result = await locationService.getLocations({
      warehouseId: req.query.warehouseId,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit,
    });

    res.status(200).json({
      success: true,
      data: result.locations,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const location = await locationService.getLocationById(req.params.id);

    res.status(200).json({
      success: true,
      data: location,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const location = await locationService.updateLocation(
      req.params.id,
      req.validatedBody || req.body,
    );

    res.status(200).json({
      success: true,
      message: "Location updated successfully",
      data: location,
    });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await locationService.deleteLocation(req.params.id);

    res.status(200).json({
      success: true,
      message: "Location deactivated successfully",
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
