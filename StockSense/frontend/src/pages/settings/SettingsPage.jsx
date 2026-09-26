import { useEffect, useState } from "react";

import api from "../../services/api";
import "../operations/receipts.css";

const initialWarehouse = { name: "", code: "", address: "" };
const initialLocation = { name: "", shortCode: "", warehouseId: "" };

export default function SettingsPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [warehouse, setWarehouse] = useState(initialWarehouse);
  const [location, setLocation] = useState(initialLocation);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const [warehouseResponse, locationResponse] = await Promise.all([
        api.get("/warehouses?isActive=true&limit=100"),
        api.get("/locations?limit=100"),
      ]);
      setWarehouses(warehouseResponse.data.data || []);
      setLocations(locationResponse.data.data || []);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || "Unable to load settings",
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submitWarehouse = async (event) => {
    event.preventDefault();
    try {
      await api.post("/warehouses", warehouse);
      setWarehouse(initialWarehouse);
      setMessage("Warehouse created successfully");
      setError("");
      await load();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || "Unable to create warehouse",
      );
    }
  };

  const submitLocation = async (event) => {
    event.preventDefault();
    try {
      await api.post("/locations", location);
      setLocation(initialLocation);
      setMessage("Location created successfully");
      setError("");
      await load();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || "Unable to create location",
      );
    }
  };

  const deactivate = async (path, label) => {
    if (!window.confirm(`Deactivate this ${label}?`)) return;
    try {
      await api.delete(path);
      setMessage(`${label} deactivated successfully`);
      setError("");
      await load();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          `Unable to deactivate ${label}`,
      );
    }
  };

  return (
    <div className="receipts-page">
      <div className="receipts-header">
        <div>
          <div className="breadcrumb">
            Settings <span>/</span> Warehouse & Location
          </div>
          <h1>Warehouse & Location</h1>
          <p>Configure where inventory is stored and moved.</p>
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
      <div className="grid gap-5 lg:grid-cols-2">
        <form className="receipt-form-card" onSubmit={submitWarehouse}>
          <h2 className="mb-4 text-lg font-bold">Add warehouse</h2>
          <div className="space-y-3">
            <input
              required
              placeholder="Warehouse name"
              value={warehouse.name}
              onChange={(e) =>
                setWarehouse({ ...warehouse, name: e.target.value })
              }
            />
            <input
              required
              placeholder="Short code"
              value={warehouse.code}
              onChange={(e) =>
                setWarehouse({ ...warehouse, code: e.target.value })
              }
            />
            <input
              placeholder="Address"
              value={warehouse.address}
              onChange={(e) =>
                setWarehouse({ ...warehouse, address: e.target.value })
              }
            />
          </div>
          <button className="primary-btn mt-4" type="submit">
            Add warehouse
          </button>
        </form>
        <form className="receipt-form-card" onSubmit={submitLocation}>
          <h2 className="mb-4 text-lg font-bold">Add location</h2>
          <div className="space-y-3">
            <input
              required
              placeholder="Location name"
              value={location.name}
              onChange={(e) =>
                setLocation({ ...location, name: e.target.value })
              }
            />
            <input
              required
              placeholder="Short code"
              value={location.shortCode}
              onChange={(e) =>
                setLocation({ ...location, shortCode: e.target.value })
              }
            />
            <select
              required
              value={location.warehouseId}
              onChange={(e) =>
                setLocation({ ...location, warehouseId: e.target.value })
              }
            >
              <option value="">Select warehouse</option>
              {warehouses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.code})
                </option>
              ))}
            </select>
          </div>
          <button className="primary-btn mt-4" type="submit">
            Add location
          </button>
        </form>
      </div>
      <div className="receipt-table-card mt-5">
        <div className="table-top">
          <strong>Warehouses</strong>
        </div>
        <div className="table-wrapper">
          <table className="receipts-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Address</th>
                <th>Locations</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {warehouses.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.code}</td>
                  <td>{item.location || "-"}</td>
                  <td>{item._count?.locations || 0}</td>
                  <td>
                    <button
                      className="row-menu"
                      onClick={() =>
                        deactivate(`/warehouses/${item.id}`, "warehouse")
                      }
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
      <div className="receipt-table-card mt-5">
        <div className="table-top">
          <strong>Locations</strong>
        </div>
        <div className="table-wrapper">
          <table className="receipts-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Short code</th>
                <th>Warehouse</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {locations.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.shortCode}</td>
                  <td>
                    {item.warehouse?.name ||
                      warehouses.find(
                        (warehouseItem) =>
                          warehouseItem.id === item.warehouseId,
                      )?.name ||
                      "-"}
                  </td>
                  <td>
                    <button
                      className="row-menu"
                      onClick={() =>
                        deactivate(`/locations/${item.id}`, "location")
                      }
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
