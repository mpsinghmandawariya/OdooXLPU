const userService = require("./user.service");

const getMe = async (req, res, next) => {
  try {
    const profile = await userService.getProfile(req.user.id);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const profile = await userService.updateProfile(
      req.user.id,
      req.validatedBody || req.body,
    );

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const ok = await userService.changePassword(
      req.user.id,
      req.validatedBody.currentPassword,
      req.validatedBody.newPassword,
    );

    res.status(200).json({
      success: true,
      data: ok,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  updateMe,
  changePassword,
};
