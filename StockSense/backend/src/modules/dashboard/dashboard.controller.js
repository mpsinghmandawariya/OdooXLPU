const dashboardService = require("./dashboard.service");

const getSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getDashboardSummary();

    res.status(200).json({
      success: true,
      message: "Dashboard summary fetched successfully",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
};
