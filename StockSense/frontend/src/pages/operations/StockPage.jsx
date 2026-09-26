import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getStock } from "../../services/stock.service";
import api from "../../services/api";
import "./receipts.css";

const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");

export default function StockPage() {
  const [stock, setStock] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
  });
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/warehouses?isActive=true"),
      api.get("/locations?isActive=true&limit=100"),
    ])
      .then(([warehouseResponse, locationResponse]) => {
        setWarehouses(warehouseResponse.data.data || []);
        setLocations(locationResponse.data.data || []);
      })
      .catch(() => setError("Unable to load stock filters"));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getStock({ search, warehouseId, locationId, page, limit: 20 })
      .then((result) => {
        if (!active) return;
        setStock(result.data || []);
        setPagination(result.pagination || { page, total: 0, totalPages: 1 });
      })
      .catch((requestError) => {
        if (!active) return;
        setStock([]);
        setError(
          requestError?.response?.data?.message || "Unable to load stock",
        );
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [search, warehouseId, locationId, page]);

  const filteredLocations = warehouseId
    ? locations.filter(
        (location) =>
          location.warehouseId === warehouseId ||
          location.warehouse?.id === warehouseId,
      )
    : locations;

  return (
    <div className="receipts-page">
      <div className="receipts-header">
        <div>
          <Link
            to="/dashboard"
            className="mb-2 inline-flex text-sm font-semibold text-gray-500 hover:text-[#E85D5D]"
          >
            ← Back to Dashboard
          </Link>
          <div className="breadcrumb">
            Inventory <span>/</span> Stock
          </div>
          <h1>Stock</h1>
          <p>Availability by product and location.</p>
        </div>
      </div>

      <div className="receipt-toolbar">
        <div className="receipt-search">
          <span aria-hidden="true">⌕</span>
          <input
            value={search}
            placeholder="Search product or SKU..."
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="receipt-filter"
          value={warehouseId}
          onChange={(event) => {
            setWarehouseId(event.target.value);
            setLocationId("");
            setPage(1);
          }}
        >
          <option value="">All warehouses</option>
          {warehouses.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </option>
          ))}
        </select>
        <select
          className="receipt-filter"
          value={locationId}
          onChange={(event) => {
            setLocationId(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All locations</option>
          {filteredLocations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="receipt-error">{error}</div>}
      <div className="receipt-table-card">
        <div className="table-top">
          <div>
            <strong>Stock availability</strong>
            <span>{pagination.total || 0} records</span>
          </div>
        </div>
        {loading ? (
          <div className="receipt-loading">Loading stock...</div>
        ) : stock.length === 0 ? (
          <div className="receipt-empty">
            <div className="empty-icon">▦</div>
            <h3>No stock records found</h3>
            <p>Validated receipts and adjustments appear here.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="receipts-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Warehouse</th>
                  <th>Location</th>
                  <th>Unit Cost</th>
                  <th>On Hand</th>
                  <th>Reserved</th>
                  <th>Free to Use</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.product.name}</strong>
                    </td>
                    <td>{item.product.sku}</td>
                    <td>{item.warehouse.name}</td>
                    <td>{item.location.name}</td>
                    <td>₹{formatNumber(item.unitCost)}</td>
                    <td>{formatNumber(item.onHand)}</td>
                    <td>{formatNumber(item.reserved)}</td>
                    <td>
                      <strong>{formatNumber(item.freeToUse)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {stock.length > 0 && (
          <div className="receipt-pagination">
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="pagination-buttons">
              <button
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                ←
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
