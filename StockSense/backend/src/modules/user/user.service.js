const bcrypt = require("bcrypt");
const prisma = require("../../config/database");

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

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

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

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!valid) {
    const error = new Error("Current password is incorrect");
    error.statusCode = 400;
    throw error;
  }

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
