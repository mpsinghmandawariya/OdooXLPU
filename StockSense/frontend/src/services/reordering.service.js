import api from "./api";

export const getReorderingRules = (params = {}) =>
  api.get("/reordering-rules", { params }).then((response) => response.data);
export const getReorderingRule = (id) =>
  api.get(`/reordering-rules/${id}`).then((response) => response.data);
export const createReorderingRule = (payload) =>
  api.post("/reordering-rules", payload).then((response) => response.data);
export const updateReorderingRule = (id, payload) =>
  api.put(`/reordering-rules/${id}`, payload).then((response) => response.data);
export const deactivateReorderingRule = (id) =>
  api.delete(`/reordering-rules/${id}`).then((response) => response.data);
