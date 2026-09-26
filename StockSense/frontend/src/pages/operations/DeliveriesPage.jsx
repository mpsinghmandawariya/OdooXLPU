import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../operations/receipts.css";
import { getDeliveries } from "../../services/delivery.service";

const STATUS_MAP = {
  DRAFT: "draft",
  READY: "ready",
  DONE: "done",
  CANCELED: "canceled",
};
const STATUS_LABELS = {
  DRAFT: "Waiting",
  READY: "Ready",
  DONE: "Done",
  CANCELED: "Canceled",
};

function StatusBadge({ status }) {
  return (
    <span className={`receipt-status ${STATUS_MAP[status] || "draft"}`}>
      <span className="status-dot" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DeliveriesPage() {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [error, setError] = useState("");

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (status !== "ALL") params.status = status;
      params.page = page;
      params.limit = 10;

      const result = await getDeliveries(params);
      setDeliveries(result.data || []);
      if (result.pagination) setPagination(result.pagination);
    } catch (err) {
      setError("Unable to load deliveries");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [page, status, search]);

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
            Operations <span>/</span> Deliveries
          </div>
          <h1>Deliveries</h1>
          <p>Manage outgoing stock to customers and destinations.</p>
        </div>
        <button
          className="new-receipt-btn"
          onClick={() => navigate("/operations/deliveries/new")}
        >
          <span>+</span> New Delivery
        </button>
      </div>

      <div className="receipt-toolbar">
        <div className="receipt-search">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            placeholder="Search reference or customer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="receipt-filter"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="ALL">All statuses</option>
          <option value="WAITING">Waiting</option>
          <option value="READY">Ready</option>
          <option value="DONE">Done</option>
          <option value="CANCELED">Canceled</option>
        </select>
        <button
          className="refresh-btn"
          onClick={fetchDeliveries}
          title="Refresh"
        >
          ↻
        </button>
      </div>

      {error && <div className="receipt-error">{error}</div>}

      <div className="receipt-table-card">
        <div className="table-top">
          <div>
            <strong>Outgoing operations</strong>
            <span>{pagination.total} deliveries</span>
          </div>
          <div className="view-controls">
            <button className="view-control active">☷</button>
            <button className="view-control">▦</button>
          </div>
        </div>

        {loading ? (
          <div className="receipt-loading">Loading deliveries...</div>
        ) : deliveries.length === 0 ? (
          <div className="receipt-empty">
            <div className="empty-icon">↑</div>
            <h3>No deliveries found</h3>
            <p>Try changing your search or create a new delivery.</p>
            <button
              className="new-receipt-btn small"
              onClick={() => navigate("/operations/deliveries/new")}
            >
              + New Delivery
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="receipts-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Scheduled Date</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => navigate(`/operations/deliveries/${d.id}`)}
                  >
                    <td>
                      <button
                        className="reference-link"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/operations/deliveries/${d.id}`);
                        }}
                      >
                        {d.referenceNumber}
                      </button>
                    </td>
                    <td>
                      <div className="contact-cell">
                        <div className="contact-avatar">
                          {(d.contact || "C").charAt(0).toUpperCase()}
                        </div>
                        <span>{d.contact || "-"}</span>
                      </div>
                    </td>
                    <td>
                      <span className="location-text">{d.from || "-"}</span>
                    </td>
                    <td>
                      <span className="location-text">{d.to || "-"}</span>
                    </td>
                    <td>{formatDate(d.scheduledDate)}</td>
                    <td>
                      <StatusBadge status={d.status} />
                    </td>
                    <td>
                      <button
                        className="row-menu"
                        onClick={(e) => e.stopPropagation()}
                      >
                        ⋮
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {deliveries.length > 0 && (
          <div className="receipt-pagination">
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="pagination-buttons">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ←
              </button>
              <button className="page-number">{page}</button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
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
