import api from "./api";

export const getDeliveries = (params = {}) =>
  api.get("/deliveries", { params }).then((r) => r.data);

export const getDeliveryById = (id) =>
  api.get(`/deliveries/${id}`).then((r) => r.data);

export const getNextDeliveryReference = () =>
  api.get("/deliveries/next-reference").then((r) => r.data);

export const createDelivery = (payload) =>
  api.post("/deliveries", payload).then((r) => r.data);

export const validateDelivery = (id) =>
  api.post(`/deliveries/${id}/validate`).then((r) => r.data);

export const markDeliveryReady = (id) =>
  api.post(`/deliveries/${id}/ready`).then((r) => r.data);

export const cancelDelivery = (id) =>
  api.post(`/deliveries/${id}/cancel`).then((r) => r.data);
