import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import api from "../../services/api";
import "./receipts.css";

export default function InventoryActionsPage() {
  const routeLocation = useLocation();
  const isAdjustment = routeLocation.pathname.includes("adjustments");
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({
    productId: "",
    sourceLocationId: "",
    destinationLocationId: "",
    locationId: "",
    quantity: "",
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/products?isActive=true&limit=100"),
      api.get("/locations?limit=100"),
    ])
      .then(([productResponse, locationResponse]) => {
        setProducts(productResponse.data.data || []);
        setLocations(locationResponse.data.data || []);
      })
      .catch(() => setError("Unable to load products and locations"));
  }, []);

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const payload = isAdjustment
        ? {
            productId: form.productId,
            locationId: form.locationId,
            quantity: Number(form.quantity),
          }
        : {
            productId: form.productId,
            sourceLocationId: form.sourceLocationId,
            destinationLocationId: form.destinationLocationId,
            quantity: Number(form.quantity),
          };
      const created = await api.post(
        isAdjustment ? "/operations/adjustments" : "/operations/transfers",
        payload,
      );
      const operationId = created.data.data.id;
      const basePath = isAdjustment
        ? "/operations/adjustments"
        : "/operations/transfers";
      await api.post(`${basePath}/${operationId}/ready`);
      await api.post(`${basePath}/${operationId}/validate`);
      setStatus(
        `${isAdjustment ? "Adjustment" : "Transfer"} validated successfully.`,
      );
      setForm({
        productId: "",
        sourceLocationId: "",
        destinationLocationId: "",
        locationId: "",
        quantity: "",
      });
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || "Unable to complete operation",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="receipt-form-page">
      <div className="receipt-form-header">
        <div>
          <div className="breadcrumb">
            Operations <span>/</span>{" "}
            {isAdjustment ? "Adjustment" : "Internal Transfer"}
          </div>
          <h1>{isAdjustment ? "Inventory Adjustment" : "Internal Transfer"}</h1>
          <p>
            {isAdjustment
              ? "Set the physical quantity and reconcile stock."
              : "Move stock atomically between locations."}
          </p>
        </div>
      </div>
      {error && <div className="receipt-error">{error}</div>}
      {status && (
        <div
          className="receipt-error"
          style={{
            background: "#eaf8f0",
            borderColor: "#b2e8cc",
            color: "#1e7a4a",
          }}
        >
          {status}
        </div>
      )}
      <form className="receipt-form-card" onSubmit={submit}>
        <div className="receipt-form-grid">
          <div className="field-group">
            <label>Product</label>
            <select
              required
              value={form.productId}
              onChange={update("productId")}
            >
              <option value="">— Select product —</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
          </div>
          {isAdjustment ? (
            <div className="field-group">
              <label>Location</label>
              <select
                required
                value={form.locationId}
                onChange={update("locationId")}
              >
                <option value="">— Select location —</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.shortCode})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className="field-group">
                <label>Source location</label>
                <select
                  required
                  value={form.sourceLocationId}
                  onChange={update("sourceLocationId")}
                >
                  <option value="">— Select source —</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} ({location.shortCode})
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label>Destination location</label>
                <select
                  required
                  value={form.destinationLocationId}
                  onChange={update("destinationLocationId")}
                >
                  <option value="">— Select destination —</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} ({location.shortCode})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div className="field-group">
            <label>{isAdjustment ? "Counted quantity" : "Quantity"}</label>
            <input
              required
              min="0"
              step="0.001"
              type="number"
              value={form.quantity}
              onChange={update("quantity")}
            />
          </div>
        </div>
        <div className="receipt-actions">
          <button type="submit" className="primary-btn" disabled={saving}>
            {saving
              ? "Processing..."
              : isAdjustment
                ? "Validate Adjustment"
                : "Validate Transfer"}
          </button>
        </div>
      </form>
    </div>
  );
}
