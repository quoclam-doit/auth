import { Navigate, Route, Routes } from "react-router-dom";
import FloatingShape from "./components/FloatingShape";

import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import DashboardPage from "./pages/DashboardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProductManagementPage from "./pages/admin/ProductManagementPage";
import OrderManagementPage from "./pages/admin/OrderManagementPage";
import ProductListingPage from "./pages/user/ProductListingPage";
import OrderHistory from "./pages/user/OrderHistory"; // 👈 THÊM IMPORT MỚI
import CartPage from "./pages/user/CartPage"; // 👈 THÊM IMPORT MỚI
import CheckoutPage from "./pages/user/CheckoutPage"; // 👈 THÊM IMPORT MỚI
import OrderSuccessPage from "./pages/user/OrderSuccessPage"; // 👈 THÊM IMPORT MỚI

import LoadingSpinner from "./components/LoadingSpinner";

import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";

// protect routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

// protect admin routes
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

// redirect authenticated users to appropriate home page based on role
const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user.isVerified) {
    // Redirect based on user role
    if (user.role === "admin") {
      return <Navigate to="/admin/products" replace />;
    } else {
      // User gets redirected to products page (main shopping page)
      return <Navigate to="/products" replace />;
    }
  }

  return children;
};

// Auth Layout with floating shapes and centering
const AuthLayout = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center relative overflow-hidden">
    <FloatingShape
      color="bg-green-500"
      size="w-64 h-64"
      top="-5%"
      left="10%"
      delay={0}
    />
    <FloatingShape
      color="bg-emerald-500"
      size="w-48 h-48"
      top="70%"
      left="80%"
      delay={5}
    />
    <FloatingShape
      color="bg-lime-500"
      size="w-32 h-32"
      top="40%"
      left="-10%"
      delay={2}
    />
    {children}
  </div>
);

function App() {
  const { isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <LoadingSpinner />;

  return (
    <>
      <Routes>
        {/* User Dashboard/Profile */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* User Routes - Clean layout without floating shapes */}
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductListingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              {/* TODO: Create ProductDetailPage */}
              <div>Product Detail Page - Coming Soon</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage /> {/* 👈 SỬ DỤNG COMPONENT THẬT */}
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage /> {/* 👈 THÊM ROUTE MỚI */}
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success/:orderId"
          element={
            <ProtectedRoute>
              <OrderSuccessPage /> {/* 👈 THÊM ROUTE MỚI */}
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderHistory /> {/* 👈 COMPONENT THẬT */}
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              {/* TODO: Create WishlistPage */}
              <div>Wishlist Page - Coming Soon</div>
            </ProtectedRoute>
          }
        />

        {/* Auth Routes - With floating shapes and centering */}
        <Route
          path="/signup"
          element={
            <RedirectAuthenticatedUser>
              <AuthLayout>
                <SignUpPage />
              </AuthLayout>
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectAuthenticatedUser>
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/verify-email"
          element={
            <AuthLayout>
              <EmailVerificationPage />
            </AuthLayout>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <RedirectAuthenticatedUser>
              <AuthLayout>
                <ForgotPasswordPage />
              </AuthLayout>
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <RedirectAuthenticatedUser>
              <AuthLayout>
                <ResetPasswordPage />
              </AuthLayout>
            </RedirectAuthenticatedUser>
          }
        />

        {/* Admin routes - Clean layout */}
        <Route
          path="/admin/products"
          element={
            <AdminProtectedRoute>
              <ProductManagementPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminProtectedRoute>
              <OrderManagementPage />
            </AdminProtectedRoute>
          }
        />

        {/* catch all routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
