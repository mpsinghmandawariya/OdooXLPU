import api from "./api";

export const getReceipts = (params = {}) =>
  api.get("/receipts", { params }).then((r) => r.data);

export const getReceiptById = (id) =>
  api.get(`/receipts/${id}`).then((r) => r.data);

export const getNextReceiptReference = () =>
  api.get("/receipts/next-reference").then((r) => r.data);

export const createReceipt = (payload) =>
  api.post("/receipts", payload).then((r) => r.data);

export const validateReceipt = (id) =>
  api.post(`/receipts/${id}/validate`).then((r) => r.data);

export const markReceiptReady = (id) =>
  api.post(`/receipts/${id}/ready`).then((r) => r.data);

export const cancelReceipt = (id) =>
  api.post(`/receipts/${id}/cancel`).then((r) => r.data);
