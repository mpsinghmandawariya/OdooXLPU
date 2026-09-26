import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "../operations/receipts.css";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();
  const [profile, setProfile] = useState(user || {});
  const [email, setEmail] = useState(user?.email || "");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .get("/users/me")
      .then((response) => {
        const next = response.data.data || response.data;
        setProfile(next);
        setEmail(next.email || "");
        login(next);
      })
      .catch((requestError) => {
        if (requestError.response?.status === 401) {
          logout();
          navigate("/login", { replace: true });
        } else
          setError(
            requestError.response?.data?.message || "Unable to load profile",
          );
      })
      .finally(() => setLoading(false));
  }, [login, logout, navigate]);

  const updateEmail = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await api.put("/users/me", { email: email.trim() });
      const next = response.data.data || response.data;
      setProfile(next);
      login(next);
      setMessage("Profile updated successfully");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to update profile",
      );
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (
      passwordForm.newPassword.length < 6 ||
      passwordForm.newPassword !== passwordForm.confirmPassword
    ) {
      setError("Check the new password and confirmation");
      return;
    }
    setSaving(true);
    try {
      await api.put("/users/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setMessage("Password changed successfully");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to change password",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="receipts-page">
        <div className="receipt-loading">Loading profile...</div>
      </div>
    );
  return (
    <div className="receipts-page">
      <div className="receipts-header">
        <div>
          <Link to="/dashboard">← Back to Dashboard</Link>
          <h1>My Profile</h1>
          <p>Manage your account information and password.</p>
        </div>
        <button
          className="ghost-btn"
          onClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
        >
          Logout
        </button>
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
      <div className="receipt-form-card mb-5">
        <h2>{profile.loginId || "User"}</h2>
        <p>
          {profile.email || "-"} · {profile.role || "USER"}
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <form className="receipt-form-card" onSubmit={updateEmail}>
          <h3>Email address</h3>
          <div className="field-group">
            <label>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button className="primary-btn mt-4" disabled={saving}>
            Save changes
          </button>
        </form>
        <form className="receipt-form-card" onSubmit={changePassword}>
          <h3>Change password</h3>
          <div className="field-group">
            <label>Current password</label>
            <input
              required
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  currentPassword: e.target.value,
                })
              }
            />
          </div>
          <div className="field-group">
            <label>New password</label>
            <input
              required
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
            />
          </div>
          <div className="field-group">
            <label>Confirm password</label>
            <input
              required
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmPassword: e.target.value,
                })
              }
            />
          </div>
          <button className="primary-btn mt-4" disabled={saving}>
            Change password
          </button>
        </form>
      </div>
    </div>
  );
}
