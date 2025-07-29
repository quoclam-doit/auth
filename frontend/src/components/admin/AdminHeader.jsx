import React from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Package, FileText, ShoppingBag } from "lucide-react";

const AdminHeader = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const adminNavItems = [
    {
      path: "/admin/products",
      label: "Quản lý sản phẩm",
      icon: Package,
    },
    {
      path: "/admin/orders",
      label: "Quản lý đơn hàng",
      icon: FileText,
    },
  ];

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <header className="w-full flex items-center justify-between bg-white shadow px-4 py-3 fixed top-0 left-0 z-50">
      {/* Logo */}
      <div className="flex items-center">
        <Link to="/admin/products" className="flex items-center space-x-2">
          <ShoppingBag className="w-8 h-8 text-green-700" />
          <div className="text-xl font-bold text-green-700">Admin Panel</div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex items-center space-x-6">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActivePath(item.path)
                  ? "bg-green-100 text-green-700 font-medium"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold text-lg">
            {user?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="hidden sm:block">
            <span className="font-medium text-gray-700">
              {user?.name || "Admin"}
            </span>
            <div className="text-xs text-green-600">Administrator</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-sm">
        <nav className="flex justify-around py-2">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActivePath(item.path) ? "text-green-600" : "text-gray-600"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default AdminHeader;
