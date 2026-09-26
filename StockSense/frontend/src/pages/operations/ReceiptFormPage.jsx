import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./receipts.css";
import api from "../../services/api";
import {
  cancelReceipt,
  createReceipt,
  getNextReceiptReference,
  getReceiptById,
  markReceiptReady,
  validateReceipt,
} from "../../services/receipt.service";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const EMPTY_LINE = () => ({
  _key: Date.now() + Math.random(),
  productId: "",
  locationId: "",
  quantity: 1,
  unitCost: 0,
});

export default function ReceiptFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // ── meta ──────────────────────────────────────────────
  const [referenceNumber, setReferenceNumber] = useState("");
  const [contact, setContact] = useState("");
  const [scheduledDate, setScheduledDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [notes, setNotes] = useState("");
  const [receiptStatus, setReceiptStatus] = useState("DRAFT");

  // ── line items ────────────────────────────────────────
  const [lines, setLines] = useState([EMPTY_LINE()]);

  // ── dropdown data ─────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [locationsByWarehouse, setLocationsByWarehouse] = useState({});
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");

  // ── ui state ──────────────────────────────────────────
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ── load reference number ─────────────────────────────
  useEffect(() => {
    if (isEdit) return;
    getNextReceiptReference()
      .then((data) => {
        if (data?.data?.referenceNumber) {
          setReferenceNumber(data.data.referenceNumber);
        }
      })
      .catch(() => setReferenceNumber("WH/IN/???"));
  }, [isEdit]);

  // ── load products & warehouses ────────────────────────
  useEffect(() => {
    Promise.all([
      api.get("/products?isActive=true").then((r) => r.data),
      api.get("/warehouses?isActive=true").then((r) => r.data),
      api.get("/locations?limit=100").then((r) => r.data),
    ])
      .then(([prodData, whData, locationData]) => {
        setProducts(prodData?.data || []);
        const whs = whData?.data || [];
        const locations = locationData?.data || [];
        const groupedLocations = locations.reduce((groups, location) => {
          const warehouseLocations = groups[location.warehouseId] || [];
          warehouseLocations.push(location);
          groups[location.warehouseId] = warehouseLocations;
          return groups;
        }, {});

        setWarehouses(whs);
        setLocationsByWarehouse(groupedLocations);

        if (!isEdit) {
          setSelectedWarehouseId((prev) => {
            if (prev) return prev;
            const warehouseWithLocation = whs.find(
              (warehouse) => groupedLocations[warehouse.id]?.length,
            );
            return warehouseWithLocation?.id || whs[0]?.id || "";
          });
        }
      })
      .catch((requestError) => {
        setError(
          requestError?.response?.data?.message ||
            requestError.message ||
            "Failed to load products and warehouses",
        );
      });
  }, [isEdit]);

  // ── load locations when warehouse changes ─────────────
  useEffect(() => {
    if (!selectedWarehouseId) return;
    if (locationsByWarehouse[selectedWarehouseId]) return;
    api
      .get(`/locations?warehouseId=${selectedWarehouseId}&limit=100`)
      .then((r) => {
        setLocationsByWarehouse((prev) => ({
          ...prev,
          [selectedWarehouseId]: r.data?.data || [],
        }));
      })
      .catch((requestError) => {
        setError(
          requestError?.response?.data?.message ||
            requestError.message ||
            "Failed to load locations",
        );
      });
  }, [selectedWarehouseId, locationsByWarehouse]);

  // ── load existing receipt when editing ────────────────
  useEffect(() => {
    if (!isEdit) return;
    getReceiptById(id)
      .then((data) => {
        const r = data?.data;
        if (!r) return;
        setReferenceNumber(r.referenceNumber || "");
        setContact(r.contact || "");
        setScheduledDate(r.scheduledDate ? r.scheduledDate.slice(0, 10) : "");
        setNotes(r.notes || "");
        setReceiptStatus(r.status || "DRAFT");
        setSelectedWarehouseId(r.warehouseId || "");
        setLines([
          {
            _key: Date.now(),
            productId: r.productId || "",
            locationId: r.locationId || "",
            quantity: Number(r.quantity) || 1,
            unitCost: Number(r.unitCost) || 0,
          },
        ]);
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load receipt",
        );
      })
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const currentLocations = locationsByWarehouse[selectedWarehouseId] || [];

  // ── line helpers ──────────────────────────────────────
  const updateLine = (index, field, value) => {
    setLines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addLine = () => setLines((prev) => [...prev, EMPTY_LINE()]);

  const removeLine = (index) =>
    setLines((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );

  // ── totals ────────────────────────────────────────────
  const totals = useMemo(
    () =>
      lines.reduce(
        (acc, l) => ({
          quantity: acc.quantity + Number(l.quantity || 0),
          amount:
            acc.amount + Number(l.quantity || 0) * Number(l.unitCost || 0),
        }),
        { quantity: 0, amount: 0 },
      ),
    [lines],
  );

  // ── validation ────────────────────────────────────────
  const validate = () => {
    if (!contact.trim()) return "Supplier / Contact is required";
    if (!selectedWarehouseId) return "Please select a warehouse";
    if (!scheduledDate) return "Please select a scheduled date";

    for (const l of lines) {
      if (!l.productId) return "Please select a product for all lines";
      if (!l.locationId) return "Please select a location for all lines";
      if (Number(l.quantity) <= 0) return "Quantity must be greater than zero";
    }
    return null;
  };

  // ── save as DRAFT ─────────────────────────────────────
  const handleSave = useCallback(async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const results = await Promise.all(
        lines.map((l, index) =>
          createReceipt({
            productId: l.productId,
            locationId: l.locationId,
            warehouseId: selectedWarehouseId || undefined,
            quantity: Number(l.quantity),
            unitCost: Number(l.unitCost) || undefined,
            contact: contact.trim(),
            referenceNumber:
              index === 0 ? referenceNumber || undefined : undefined,
            scheduledDate: scheduledDate || undefined,
            notes: notes || undefined,
            status: "DRAFT",
          }),
        ),
      );

      const failed = results.find((r) => !r.success);
      if (failed) throw new Error(failed.message || "Failed to save");

      setSuccess("Receipt saved as draft");
      setReceiptStatus("DRAFT");
      if (!isEdit && results[0]?.data?.id) {
        navigate(`/operations/receipts/${results[0].data.id}`, {
          replace: true,
        });
      }
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || "Failed to save receipt",
      );
    } finally {
      setSaving(false);
    }
  }, [
    lines,
    contact,
    referenceNumber,
    scheduledDate,
    notes,
    selectedWarehouseId,
    isEdit,
    navigate,
  ]);

  const handleReady = useCallback(async () => {
    if (!isEdit || !id) {
      await handleSave();
      return;
    }

    setValidating(true);
    setError("");
    try {
      await markReceiptReady(id);
      setReceiptStatus("READY");
      setSuccess("Receipt marked ready. You can now validate it.");
    } catch (e) {
      setError(
        e.response?.data?.message ||
          e.message ||
          "Unable to mark receipt ready",
      );
    } finally {
      setValidating(false);
    }
  }, [handleSave, id, isEdit]);

  const handleCancel = useCallback(async () => {
    if (!isEdit || !id) {
      navigate("/operations/receipts");
      return;
    }

    setValidating(true);
    setError("");
    try {
      await cancelReceipt(id);
      setReceiptStatus("CANCELLED");
      setSuccess("Receipt cancelled.");
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || "Unable to cancel receipt",
      );
    } finally {
      setValidating(false);
    }
  }, [id, isEdit, navigate]);

  // ── validate (READY → COMPLETED + stock) ─────────────
  const handleValidate = useCallback(async () => {
    setError("");
    setSuccess("");

    if (isEdit && id) {
      setValidating(true);
      try {
        await validateReceipt(id);
        setReceiptStatus("COMPLETED");
        setSuccess("Receipt validated — stock has been updated!");
      } catch (e) {
        setError(
          e.response?.data?.message || e.message || "Validation failed",
        );
      } finally {
        setValidating(false);
      }
      return;
    }

    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setValidating(true);
    try {
      await handleSave();
      setSuccess(
        "Receipt saved as draft. Open it and mark it ready before validation.",
      );
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || "Validation failed",
      );
    } finally {
      setValidating(false);
    }
  }, [isEdit, id, lines, handleSave]);

  const isCompleted =
    receiptStatus === "COMPLETED" ||
    receiptStatus === "DONE" ||
    receiptStatus === "CANCELLED";
  const isReady = receiptStatus === "READY";

  if (loading) {
    return (
      <div className="receipt-form-page">
        <div className="receipt-loading" style={{ minHeight: "60vh" }}>
          Loading receipt...
        </div>
      </div>
    );
  }

  return (
    <div className="receipt-form-page">
      {/* Header */}
      <div className="receipt-form-header">
        <div>
          <div className="breadcrumb">
            <Link to="/operations/receipts">Operations</Link>
            <span>/</span>
            <span>{isEdit ? "Edit Receipt" : "New Receipt"}</span>
          </div>
          <h1>{isEdit ? "Edit Receipt" : "New Receipt"}</h1>
        </div>

        {isCompleted && (
          <span className="receipt-status done" style={{ fontSize: 13 }}>
            <span className="status-dot" />
            {receiptStatus === "CANCELLED" ? "Cancelled" : "Completed"}
          </span>
        )}
      </div>

      {error && <div className="receipt-error">{error}</div>}
      {success && (
        <div
          className="receipt-error"
          style={{
            background: "#eaf8f0",
            borderColor: "#b2e8cc",
            color: "#1e7a4a",
          }}
        >
          {success}
        </div>
      )}

      <div className="receipt-form-card">
        {/* Meta fields */}
        <div className="receipt-form-grid">
          <div className="field-group">
            <label>Reference</label>
            <input
              value={referenceNumber}
              readOnly
              style={{ background: "#f4f6f9", color: "#6c7a8d" }}
            />
          </div>

          <div className="field-group">
            <label>Warehouse</label>
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              disabled={isCompleted}
            >
              <option value="">— Select warehouse —</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>
              Supplier / Contact <span style={{ color: "#e95757" }}>*</span>
            </label>
            <input
              type="text"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              placeholder="Enter supplier or contact name"
              maxLength={200}
              disabled={isCompleted}
            />
          </div>

          <div className="field-group">
            <label>Scheduled Date</label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              disabled={isCompleted}
            />
          </div>

          <div className="field-group">
            <label>Status</label>
            <input
              value={receiptStatus}
              readOnly
              style={{
                background: "#f4f6f9",
                color: isCompleted ? "#1e7a4a" : "#6c7a8d",
              }}
            />
          </div>
        </div>

        {/* Line items */}
        <div className="receipt-items-box">
          <div className="receipt-items-header">
            <h3>Products</h3>
            {!isCompleted && (
              <button type="button" className="secondary-btn" onClick={addLine}>
                + Add Line
              </button>
            )}
          </div>

          <div className="table-wrapper">
            <table className="receipt-items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Location</th>
                  <th>Quantity</th>
                  <th>Unit Cost (₹)</th>
                  <th>Total</th>
                  {!isCompleted && <th />}
                </tr>
              </thead>
              <tbody>
                {lines.map((line, index) => (
                  <tr key={line._key}>
                    <td>
                      <select
                        value={line.productId}
                        onChange={(e) =>
                          updateLine(index, "productId", e.target.value)
                        }
                        disabled={isCompleted}
                      >
                        <option value="">— Select product —</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={line.locationId}
                        onChange={(e) =>
                          updateLine(index, "locationId", e.target.value)
                        }
                        disabled={isCompleted || !selectedWarehouseId}
                      >
                        <option value="">— Select location —</option>
                        {currentLocations.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name} ({l.shortCode})
                          </option>
                        ))}
                      </select>
                      {!currentLocations.length && selectedWarehouseId && (
                        <small className="field-help">
                          No active locations exist for this warehouse. Choose
                          another warehouse or add a location in Settings.
                        </small>
                      )}
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) =>
                          updateLine(index, "quantity", e.target.value)
                        }
                        disabled={isCompleted}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={line.unitCost}
                        onChange={(e) =>
                          updateLine(index, "unitCost", e.target.value)
                        }
                        disabled={isCompleted}
                      />
                    </td>
                    <td>
                      <span className="amount-pill">
                        {money(
                          Number(line.quantity || 0) *
                            Number(line.unitCost || 0),
                        )}
                      </span>
                    </td>
                    {!isCompleted && (
                      <td>
                        <button
                          type="button"
                          className="row-menu"
                          onClick={() => removeLine(index)}
                          title="Remove line"
                          style={{ color: "#e95757" }}
                        >
                          ×
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        <div className="field-group notes-field">
          <label>Notes</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes about this receipt..."
            disabled={isCompleted}
          />
        </div>

        {/* Summary */}
        <div className="receipt-summary-row">
          <div>
            <span>Total Qty:</span>
            <strong>{totals.quantity}</strong>
          </div>
          <div>
            <span>Estimated Value:</span>
            <strong>{money(totals.amount)}</strong>
          </div>
        </div>

        {/* Actions */}
        <div className="receipt-actions">
          <button
            type="button"
            className="ghost-btn"
            onClick={() => navigate("/operations/receipts")}
          >
            Cancel
          </button>

          {!isCompleted && (
            <>
              <button
                type="button"
                className="secondary-btn"
                onClick={handleSave}
                disabled={saving || validating}
              >
                {saving ? "Saving..." : "Save Draft"}
              </button>

              {!isReady && (
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleReady}
                  disabled={saving || validating}
                >
                  {validating ? "Updating..." : "Mark Ready"}
                </button>
              )}
              {isReady && (
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleValidate}
                  disabled={saving || validating}
                >
                  {validating ? "Validating..." : "Validate"}
                </button>
              )}
              <button
                type="button"
                className="ghost-btn"
                onClick={handleCancel}
                disabled={saving || validating}
              >
                Cancel Receipt
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
