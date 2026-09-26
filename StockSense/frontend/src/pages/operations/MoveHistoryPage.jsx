import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../operations/receipts.css";
import { getMoveHistory } from "../../services/stock.service";

const MOVE_TYPE_LABELS = {
  IN: "Receipt",
  OUT: "Delivery",
  TRANSFER: "Transfer",
  ADJUSTMENT: "Adjustment",
};
const MOVE_TYPE_COLORS = {
  IN: { bg: "#eaf8f0", color: "#258052" },
  OUT: { bg: "#fff0f0", color: "#d54d4d" },
  TRANSFER: { bg: "#edf5ff", color: "#3775b9" },
  ADJUSTMENT: { bg: "#fff7e7", color: "#ad7512" },
};

function MoveTypeBadge({ type }) {
  const style = MOVE_TYPE_COLORS[type] || { bg: "#f1f3f6", color: "#687386" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 9px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 750,
        background: style.bg,
        color: style.color,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: style.color,
          display: "inline-block",
        }}
      />
      {MOVE_TYPE_LABELS[type] || type}
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

export default function MoveHistoryPage() {
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moveType, setMoveType] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [error, setError] = useState("");

  const fetchMoves = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (moveType !== "ALL") params.moveType = moveType;
      params.page = page;
      params.limit = 20;

      const result = await getMoveHistory(params);
      setMoves(result.data || []);
      if (result.pagination) setPagination(result.pagination);
    } catch (err) {
      setError("Unable to load move history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoves();
  }, [page, moveType, search]);

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
            Operations <span>/</span> Move History
          </div>
          <h1>Move History</h1>
          <p>Complete stock movement ledger across all operations.</p>
        </div>
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
            placeholder="Search reference, product or contact..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="receipt-filter"
          value={moveType}
          onChange={(e) => {
            setMoveType(e.target.value);
            setPage(1);
          }}
        >
          <option value="ALL">All types</option>
          <option value="IN">Receipt (IN)</option>
          <option value="OUT">Delivery (OUT)</option>
          <option value="TRANSFER">Transfer</option>
          <option value="ADJUSTMENT">Adjustment</option>
        </select>
        <button className="refresh-btn" onClick={fetchMoves} title="Refresh">
          ↻
        </button>
      </div>

      {error && <div className="receipt-error">{error}</div>}

      <div className="receipt-table-card">
        <div className="table-top">
          <div>
            <strong>Stock movements</strong>
            <span>{pagination.total} records</span>
          </div>
        </div>

        {loading ? (
          <div className="receipt-loading">Loading move history...</div>
        ) : moves.length === 0 ? (
          <div className="receipt-empty">
            <div className="empty-icon">↕</div>
            <h3>No movements found</h3>
            <p>
              Stock movements appear here after receipts or deliveries are
              validated.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="receipts-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Type</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Contact</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {moves.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <span style={{ fontWeight: 750, color: "#e95757" }}>
                        {m.reference}
                      </span>
                    </td>
                    <td>
                      <MoveTypeBadge type={m.moveType} />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#334056" }}>
                        {m.product?.name || "-"}
                      </div>
                      <div style={{ fontSize: 11, color: "#8a95a6" }}>
                        {m.product?.sku}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 750,
                          color:
                            m.moveType === "IN"
                              ? "#258052"
                              : m.moveType === "OUT"
                                ? "#d54d4d"
                                : "#3775b9",
                        }}
                      >
                        {m.moveType === "IN"
                          ? "+"
                          : m.moveType === "OUT"
                            ? "-"
                            : ""}
                        {Number(m.quantity)}
                      </span>
                    </td>
                    <td>
                      <span className="location-text">
                        {m.sourceLocation
                          ? `${m.sourceLocation.warehouse?.name || ""} / ${m.sourceLocation.name}`
                          : "-"}
                      </span>
                    </td>
                    <td>
                      <span className="location-text">
                        {m.destinationLocation
                          ? `${m.destinationLocation.warehouse?.name || ""} / ${m.destinationLocation.name}`
                          : "-"}
                      </span>
                    </td>
                    <td>
                      <span className="location-text">{m.contact || "-"}</span>
                    </td>
                    <td style={{ color: "#8a95a6", fontSize: 12 }}>
                      {formatDate(m.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {moves.length > 0 && (
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
