import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  createReorderingRule,
  deactivateReorderingRule,
  getReorderingRules,
  updateReorderingRule,
} from "../../services/reordering.service";
import "../operations/receipts.css";

const emptyForm = {
  productId: "",
  warehouseId: "",
  locationId: "",
  minimumQuantity: "",
  maximumQuantity: "",
  reorderQuantity: "",
};

export default function ReorderingRulesPage() {
  const [rules, setRules] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [
        ruleResponse,
        productResponse,
        warehouseResponse,
        locationResponse,
      ] = await Promise.all([
        getReorderingRules(),
        api.get("/products?isActive=true"),
        api.get("/warehouses?isActive=true&limit=100"),
        api.get("/locations?limit=100"),
      ]);
      setRules(ruleResponse.data || []);
      setProducts(productResponse.data.data || []);
      setWarehouses(warehouseResponse.data.data || []);
      setLocations(locationResponse.data.data || []);
      setError("");
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to load reordering rules",
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));
  const filteredRules = rules.filter(
    (rule) =>
      !search ||
      `${rule.product?.name} ${rule.product?.sku}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const scopedLocations = form.warehouseId
    ? locations.filter((location) => location.warehouseId === form.warehouseId)
    : locations;

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        productId: form.productId,
        warehouseId: form.warehouseId || null,
        locationId: form.locationId || null,
        minimumQuantity: Number(form.minimumQuantity),
        maximumQuantity: Number(form.maximumQuantity),
        reorderQuantity: Number(form.reorderQuantity),
      };
      if (editingId) await updateReorderingRule(editingId, payload);
      else await createReorderingRule(payload);
      setForm(emptyForm);
      setEditingId("");
      setMessage("Reordering rule saved successfully");
      await load();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to save reordering rule",
      );
    } finally {
      setSaving(false);
    }
  };

  const edit = (rule) => {
    setEditingId(rule.id);
    setForm({
      productId: rule.productId,
      warehouseId: rule.warehouseId || "",
      locationId: rule.locationId || "",
      minimumQuantity: rule.minimumQuantity,
      maximumQuantity: rule.maximumQuantity,
      reorderQuantity: rule.reorderQuantity,
    });
  };

  const deactivate = async (id) => {
    if (!window.confirm("Deactivate this reordering rule?")) return;
    try {
      await deactivateReorderingRule(id);
      setMessage("Reordering rule deactivated");
      await load();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || "Unable to deactivate rule",
      );
    }
  };

  return (
    <div className="receipts-page">
      <Link
        to="/dashboard"
        className="mb-2 inline-flex text-sm font-semibold text-gray-500 hover:text-[#E85D5D]"
      >
        ← Back to Dashboard
      </Link>
      <div className="receipts-header">
        <div>
          <div className="breadcrumb">
            Inventory <span>/</span> Reordering Rules
          </div>
          <h1>Reordering Rules</h1>
          <p>Set minimum, maximum, and reorder quantities for stock alerts.</p>
        </div>
      </div>
      {error && <div className="receipt-error">{error}</div>}
      {message && (
        <div
          className="receipt-error"
          style={{
            background: "#eaf8f0",
            borderColor: "#b2e8cc",
            color: "#1e7a4a",
          }}
        >
          {message}
        </div>
      )}
      <form className="receipt-form-card mb-5" onSubmit={submit}>
        <div className="receipt-items-header">
          <h3>{editingId ? "Edit Rule" : "New Rule"}</h3>
          {editingId && (
            <button
              type="button"
              className="ghost-btn"
              onClick={() => {
                setEditingId("");
                setForm(emptyForm);
              }}
            >
              Cancel edit
            </button>
          )}
        </div>
        <div className="receipt-form-grid">
          <div className="field-group">
            <label>Product</label>
            <select
              required
              value={form.productId}
              onChange={update("productId")}
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label>Warehouse</label>
            <select
              value={form.warehouseId}
              onChange={(event) =>
                setForm({
                  ...form,
                  warehouseId: event.target.value,
                  locationId: "",
                })
              }
            >
              <option value="">All warehouses</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label>Location</label>
            <select value={form.locationId} onChange={update("locationId")}>
              <option value="">All locations</option>
              {scopedLocations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label>Minimum quantity</label>
            <input
              required
              min="0"
              step="0.001"
              type="number"
              value={form.minimumQuantity}
              onChange={update("minimumQuantity")}
            />
          </div>
          <div className="field-group">
            <label>Maximum quantity</label>
            <input
              required
              min="0"
              step="0.001"
              type="number"
              value={form.maximumQuantity}
              onChange={update("maximumQuantity")}
            />
          </div>
          <div className="field-group">
            <label>Reorder quantity</label>
            <input
              required
              min="0.001"
              step="0.001"
              type="number"
              value={form.reorderQuantity}
              onChange={update("reorderQuantity")}
            />
          </div>
        </div>
        <button className="primary-btn mt-4" type="submit" disabled={saving}>
          {saving ? "Saving..." : editingId ? "Update rule" : "Create rule"}
        </button>
      </form>
      <div className="receipt-toolbar">
        <div className="receipt-search">
          <span>⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search product or SKU..."
          />
        </div>
      </div>
      <div className="receipt-table-card">
        <div className="table-top">
          <strong>Rules</strong>
          <span>{filteredRules.length} rules</span>
        </div>
        <div className="table-wrapper">
          <table className="receipts-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Scope</th>
                <th>Minimum</th>
                <th>Maximum</th>
                <th>Reorder</th>
                <th>Free to use</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredRules.map((rule) => (
                <tr key={rule.id}>
                  <td>
                    <strong>{rule.product?.name}</strong>
                    <div className="text-xs text-gray-400">
                      {rule.product?.sku}
                    </div>
                  </td>
                  <td>
                    {rule.location?.name || rule.warehouse?.name || "Global"}
                  </td>
                  <td>{Number(rule.minimumQuantity)}</td>
                  <td>{Number(rule.maximumQuantity)}</td>
                  <td>{Number(rule.reorderQuantity)}</td>
                  <td>
                    <strong>{Number(rule.stock?.freeToUse || 0)}</strong>
                  </td>
                  <td>
                    <span
                      className={`receipt-status ${rule.needsReorder ? "canceled" : "done"}`}
                    >
                      {rule.needsReorder ? "Reorder needed" : "Healthy"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="secondary-btn"
                      onClick={() => edit(rule)}
                    >
                      Edit
                    </button>{" "}
                    <button
                      className="row-menu"
                      onClick={() => deactivate(rule.id)}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
