import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";
import UserLayout from "../../components/user/UserLayout";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShoppingCart,
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
  } = useCartStore();

  const [updatingItems, setUpdatingItems] = useState(new Set());

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityUpdate = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setUpdatingItems((prev) => new Set(prev).add(productId));

    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      toast.error(error.message || "Không thể cập nhật số lượng");
    } finally {
      setUpdatingItems((prev) => {
        const updated = new Set(prev);
        updated.delete(productId);
        return updated;
      });
    }
  };

  const handleRemoveItem = (productId, productName) => {
    removeFromCart(productId);
    toast.success(`Đã xóa ${productName} khỏi giỏ hàng`);
  };

  const handleClearCart = () => {
    if (window.confirm("Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?")) {
      clearCart();
      toast.success("Đã xóa tất cả sản phẩm khỏi giỏ hàng");
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Giỏ hàng trống!");
      return;
    }
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <UserLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Giỏ hàng trống
            </h2>
            <p className="text-gray-600 mb-8">
              Bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá các sản phẩm
              tuyệt vời của chúng tôi!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              Tiếp tục mua sắm
            </Link>
          </motion.div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Giỏ hàng của bạn
          </h1>
          <p className="text-gray-600">
            Bạn có {getTotalItems()} sản phẩm trong giỏ hàng
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Clear Cart Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Sản phẩm ({items.length})
              </h2>
              <button
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
              >
                Xóa tất cả
              </button>
            </div>

            {/* Cart Items List */}
            <div className="space-y-4">
              {items.map((item, index) => {
                const isUpdating = updatingItems.has(item.productId);

                return (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-sm border p-6"
                  >
                    <div className="flex items-center gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image || "/placeholder-product.jpg"}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 truncate">
                          {item.productName}
                        </h3>
                        <p className="text-blue-600 font-bold text-lg">
                          {formatPrice(item.price)}
                        </p>
                        {item.maxInventory <= 5 && (
                          <p className="text-orange-600 text-xs mt-1">
                            Chỉ còn {item.maxInventory} sản phẩm
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() =>
                              handleQuantityUpdate(
                                item.productId,
                                item.quantity - 1
                              )
                            }
                            disabled={item.quantity <= 1 || isUpdating}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 min-w-[50px] text-center font-medium">
                            {isUpdating ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityUpdate(
                                item.productId,
                                item.quantity + 1
                              )
                            }
                            disabled={
                              item.quantity >= item.maxInventory || isUpdating
                            }
                            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() =>
                            handleRemoveItem(item.productId, item.productName)
                          }
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right min-w-[100px]">
                        <p className="font-bold text-lg text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-sm border p-6 sticky top-24"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-4">
                {/* Items Summary */}
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính ({getTotalItems()} sản phẩm)</span>
                  <span>{formatPrice(getCartTotal())}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Tổng cộng</span>
                    <span className="text-blue-600">
                      {formatPrice(getCartTotal())}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      Tiến hành thanh toán
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Continue Shopping */}
                <Link
                  to="/products"
                  className="block w-full text-center text-blue-600 hover:text-blue-700 font-medium py-2 transition-colors"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>

              {/* Security Note */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-green-800 text-sm text-center">
                  🔒 Thanh toán an toàn và bảo mật
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default CartPage;
