import { useEffect, useState } from "react";

import {
  createCategory,
  createProduct,
  deactivateProduct,
  getCategories,
  getProductStock,
  getProducts,
  updateProduct,
} from "../../services/products.service";
import "../operations/receipts.css";

const emptyForm = {
  name: "",
  sku: "",
  unitPrice: "",
  unitOfMeasure: "pcs",
  categoryId: "",
  description: "",
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [stockProduct, setStockProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const [productResponse, categoryResponse] = await Promise.all([
        getProducts({
          search: search || undefined,
          categoryId: categoryId || undefined,
          isActive: showInactive ? undefined : "true",
        }),
        getCategories({ isActive: "true" }),
      ]);
      setProducts(productResponse.data || []);
      setCategories(categoryResponse.data || []);
      setError("");
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || "Unable to load products",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search, categoryId, showInactive]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = { ...form, unitPrice: Number(form.unitPrice) };
      if (editingId) await updateProduct(editingId, payload);
      else await createProduct(payload);
      setForm(emptyForm);
      setEditingId("");
      setMessage(
        editingId
          ? "Product updated successfully"
          : "Product created successfully",
      );
      await load();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || "Unable to save product",
      );
    } finally {
      setSaving(false);
    }
  };

  const edit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      sku: product.sku || "",
      unitPrice: product.unitPrice || "",
      unitOfMeasure: product.unitOfMeasure || "pcs",
      categoryId: product.categoryId || product.category?.id || "",
      description: product.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deactivate = async (id) => {
    if (!window.confirm("Deactivate this product?")) return;
    try {
      await deactivateProduct(id);
      setMessage("Product deactivated successfully");
      await load();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || "Unable to deactivate product",
      );
    }
  };

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const submitCategory = async (event) => {
    event.preventDefault();
    if (!categoryForm.name.trim()) return;
    try {
      const response = await createCategory({
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim() || null,
        isActive: true,
      });
      const created = response?.data || response;
      if (created?.id)
        setForm((current) => ({ ...current, categoryId: created.id }));
      setCategoryForm({ name: "", description: "" });
      setShowCategoryForm(false);
      await load();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || "Unable to create category",
      );
    }
  };

  const viewStock = async (product) => {
    try {
      const response = await getProductStock(product.id);
      setStockProduct({ product, stock: response.data });
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || "Unable to load product stock",
      );
    }
  };

  return (
    <div className="receipts-page">
      <div className="receipts-header">
        <div>
          <div className="breadcrumb">
            Inventory <span>/</span> Products
          </div>
          <h1>Products</h1>
          <p>Manage products, SKUs, categories, and unit costs.</p>
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
          <h3>{editingId ? "Edit Product" : "New Product"}</h3>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => setShowCategoryForm((current) => !current)}
          >
            + Category
          </button>
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
            <label>Name</label>
            <input
              required
              value={form.name}
              onChange={update("name")}
              placeholder="Product name"
            />
          </div>
          <div className="field-group">
            <label>SKU</label>
            <input
              required
              value={form.sku}
              onChange={update("sku")}
              placeholder="PRD-001"
            />
          </div>
          <div className="field-group">
            <label>Unit price</label>
            <input
              required
              min="0.01"
              step="0.01"
              type="number"
              value={form.unitPrice}
              onChange={update("unitPrice")}
            />
          </div>
          <div className="field-group">
            <label>Unit of measure</label>
            <input
              required
              value={form.unitOfMeasure}
              onChange={update("unitOfMeasure")}
            />
          </div>
          <div className="field-group">
            <label>Category</label>
            <select
              required
              value={form.categoryId}
              onChange={update("categoryId")}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label>Description</label>
            <input
              value={form.description}
              onChange={update("description")}
              placeholder="Optional description"
            />
          </div>
        </div>
        <button className="primary-btn mt-4" type="submit" disabled={saving}>
          {saving
            ? "Saving..."
            : editingId
              ? "Update product"
              : "Create product"}
        </button>
      </form>
      {showCategoryForm && (
        <form className="receipt-form-card mb-5" onSubmit={submitCategory}>
          <h3>New Category</h3>
          <div className="receipt-form-grid">
            <div className="field-group">
              <label>Name</label>
              <input
                required
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name: e.target.value })
                }
              />
            </div>
            <div className="field-group">
              <label>Description</label>
              <input
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <button className="primary-btn mt-4" type="submit">
            Create category
          </button>
        </form>
      )}
      <div className="receipt-toolbar">
        <div className="receipt-search">
          <span aria-hidden="true">⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or SKU..."
          />
        </div>
        <select
          className="receipt-filter"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />{" "}
          Show inactive
        </label>
      </div>
      <div className="receipt-table-card">
        <div className="table-top">
          <strong>Product catalogue</strong>
          <span>{products.length} products</span>
        </div>
        {loading ? (
          <div className="receipt-loading">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="receipt-empty">
            <h3>No products found</h3>
            <p>Create your first product above.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="receipts-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Unit cost</th>
                  <th>Unit</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                    </td>
                    <td>{product.sku}</td>
                    <td>{product.category?.name || "-"}</td>
                    <td>
                      ₹{Number(product.unitPrice || 0).toLocaleString("en-IN")}
                    </td>
                    <td>{product.unitOfMeasure}</td>
                    <td>
                      <button
                        className="secondary-btn"
                        onClick={() => viewStock(product)}
                      >
                        Stock
                      </button>{" "}
                      <button
                        className="secondary-btn"
                        onClick={() => edit(product)}
                      >
                        Edit
                      </button>{" "}
                      <button
                        className="row-menu"
                        onClick={() => deactivate(product.id)}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {stockProduct && (
        <div className="modal-overlay" onClick={() => setStockProduct(null)}>
          <div
            className="modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="receipt-items-header">
              <h3>{stockProduct.product.name} stock</h3>
              <button
                className="ghost-btn"
                onClick={() => setStockProduct(null)}
              >
                Close
              </button>
            </div>
            <div className="receipt-summary-row">
              <div>
                <span>On hand</span>
                <strong>{Number(stockProduct.stock?.totalOnHand || 0)}</strong>
              </div>
              <div>
                <span>Reserved</span>
                <strong>
                  {Number(stockProduct.stock?.totalReserved || 0)}
                </strong>
              </div>
              <div>
                <span>Free to use</span>
                <strong>
                  {Number(stockProduct.stock?.totalFreeToUse || 0)}
                </strong>
              </div>
            </div>
            {stockProduct.stock?.locations?.map((item) => (
              <div
                className="stock-location-row"
                key={item.location?.id || item.id}
              >
                <span>
                  {item.location?.warehouse?.name || "Warehouse"} /{" "}
                  {item.location?.name || "Location"}
                </span>
                <strong>{Number(item.onHand || item.quantity || 0)}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
