import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import UserLayout from "../../components/user/UserLayout";
import { useCartStore } from "../../store/cartStore";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";

const CartPage = () => {
  const navigate = useNavigate();
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getTotalItems,
    isLoading,
    error,
  } = useCartStore();

  const [isUpdating, setIsUpdating] = useState({});

  const handleQuantityUpdate = async (productId, newQuantity) => {
    setIsUpdating((prev) => ({ ...prev, [productId]: true }));
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsUpdating((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleRemoveItem = (productId, productName) => {
    removeFromCart(productId);
    toast.success(`Đã xóa "${productName}" khỏi giỏ hàng`);
  };

  const handleClearCart = () => {
    if (
      window.confirm("Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?")
    ) {
      clearCart();
      toast.success("Đã xóa tất cả sản phẩm khỏi giỏ hàng");
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }
    navigate("/checkout");
  };

  const shippingFee = 30000; // Fixed shipping fee
  const finalTotal = getCartTotal() + shippingFee;

  if (items.length === 0) {
    return (
      <UserLayout>
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <ShoppingCart className="w-24 h-24 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Giỏ hàng trống
              </h2>
              <p className="text-gray-600 mb-8">
                Bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá các sản
                phẩm tuyệt vời của chúng tôi!
              </p>
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng</h1>
              <p className="text-gray-600 mt-2">
                {getTotalItems()} sản phẩm trong giỏ hàng
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tiếp tục mua sắm
            </Link>
          </div>

          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-lg shadow-sm border">
                {/* Clear Cart Button */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Sản phẩm
                  </h2>
                  <button
                    onClick={handleClearCart}
                    className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                  >
                    Xóa tất cả
                  </button>
                </div>

                {/* Items List */}
                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-4"
                    >
                      <div className="flex items-center space-x-4">
                        {/* Product Image */}
                        <img
                          src={
                            item.image
                              ? `http://localhost:5000/${item.image.replace(
                                  /\\/g,
                                  "/"
                                )}`
                              : "/placeholder-image.jpg"
                          }
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded-lg"
                        />

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {item.productName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {item.price.toLocaleString("vi-VN")}đ / sản phẩm
                          </p>
                          <p className="text-xs text-gray-400">
                            Còn lại: {item.maxInventory} sản phẩm
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              handleQuantityUpdate(
                                item.productId,
                                item.quantity - 1
                              )
                            }
                            disabled={
                              item.quantity <= 1 || isUpdating[item.productId]
                            }
                            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <span className="w-12 text-center font-medium">
                            {isUpdating[item.productId] ? "..." : item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              handleQuantityUpdate(
                                item.productId,
                                item.quantity + 1
                              )
                            }
                            disabled={
                              item.quantity >= item.maxInventory ||
                              isUpdating[item.productId]
                            }
                            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {(item.price * item.quantity).toLocaleString(
                              "vi-VN"
                            )}
                            đ
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() =>
                            handleRemoveItem(item.productId, item.productName)
                          }
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Tóm tắt đơn hàng
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Tạm tính ({getTotalItems()} sản phẩm)
                    </span>
                    <span className="font-medium">
                      {getCartTotal().toLocaleString("vi-VN")}đ
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="font-medium">
                      {shippingFee.toLocaleString("vi-VN")}đ
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-semibold text-gray-900">
                        Tổng cộng
                      </span>
                      <span className="text-xl font-bold text-blue-600">
                        {finalTotal.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? "Đang xử lý..." : "Tiến hành thanh toán"}
                </button>

                {/* Security Note */}
                <p className="text-xs text-gray-500 mt-4 text-center">
                  🔒 Thông tin của bạn được bảo mật an toàn
                </p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default CartPage;
