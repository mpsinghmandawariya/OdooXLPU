import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import Dashboard from "../pages/dashboard/Dashboard";
import DeliveriesPage from "../pages/operations/DeliveriesPage";
import DeliveryFormPage from "../pages/operations/DeliveryFormPage";
import MoveHistoryPage from "../pages/operations/MoveHistoryPage";
import InventoryActionsPage from "../pages/operations/InventoryActionsPage";
import StockPage from "../pages/operations/StockPage";
import SettingsPage from "../pages/settings/SettingsPage";
import ProductsPage from "../pages/products/ProductsPage";
import ReceiptFormPage from "../pages/operations/ReceiptFormPage";
import ReceiptsPage from "../pages/operations/ReceiptsPage";
import ReorderingRulesPage from "../pages/reordering/ReorderingRulesPage";
import ProfilePage from "../pages/profile/ProfilePage";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/operations"
        element={<Navigate to="/operations/receipts" replace />}
      />

      <Route
        path="/operations/receipts"
        element={
          <ProtectedRoute>
            <ReceiptsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/operations/receipts/new"
        element={
          <ProtectedRoute>
            <ReceiptFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/operations/receipts/:id"
        element={
          <ProtectedRoute>
            <ReceiptFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/operations/deliveries"
        element={
          <ProtectedRoute>
            <DeliveriesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/operations/deliveries/new"
        element={
          <ProtectedRoute>
            <DeliveryFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/operations/deliveries/:id"
        element={
          <ProtectedRoute>
            <DeliveryFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/move-history"
        element={
          <ProtectedRoute>
            <MoveHistoryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/stock"
        element={
          <ProtectedRoute>
            <StockPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <ProductsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/operations/transfers/new"
        element={
          <ProtectedRoute>
            <InventoryActionsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/operations/adjustments/new"
        element={
          <ProtectedRoute>
            <InventoryActionsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reordering-rules"
        element={
          <ProtectedRoute>
            <ReorderingRulesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
