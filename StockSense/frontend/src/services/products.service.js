import api from "./api";

export const getProducts = (params = {}) =>
  api.get("/products", { params }).then((response) => response.data);

export const getProductById = (id) =>
  api.get(`/products/${id}`).then((response) => response.data);

export const createProduct = (payload) =>
  api.post("/products", payload).then((response) => response.data);

export const updateProduct = (id, payload) =>
  api.put(`/products/${id}`, payload).then((response) => response.data);

export const deactivateProduct = (id) =>
  api.delete(`/products/${id}`).then((response) => response.data);

export const getCategories = (params = {}) =>
  api.get("/categories", { params }).then((response) => response.data);

export const createCategory = (payload) =>
  api.post("/categories", payload).then((response) => response.data);

export const getProductStock = (productId) =>
  api.get(`/stock/product/${productId}`).then((response) => response.data);
