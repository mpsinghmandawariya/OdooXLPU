import api from "./api";

export const getStock = (params = {}) =>
  api.get("/stock", { params }).then((r) => r.data);

export const getProductStock = (productId) =>
  api.get(`/stock/product/${productId}`).then((r) => r.data);

export const getMoveHistory = (params = {}) =>
  api.get("/move-history", { params }).then((r) => r.data);
