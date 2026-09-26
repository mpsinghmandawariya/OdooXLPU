const bcrypt = require("bcrypt");
const prisma = require("../../config/database");
const { AppError } = require("../../utils/errors");

const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      loginId: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) throw new AppError("User not found", 404);

  return user;
};

const updateProfile = async (userId, data) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      email: data.email,
    },
    select: {
      id: true,
      loginId: true,
      email: true,
      role: true,
    },
  });
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new AppError("User not found", 404);

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!valid) throw new AppError("Current password is incorrect", 400);

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return true;
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
