import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Calendar,
  CreditCard,
  Eye,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { formatPrice, formatDate } from "../../utils/helpers";
import UserLayout from "../../components/user/UserLayout";
import toast from "react-hot-toast";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuthStore();

  // Fetch customer orders
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:5000/api/orders/my-orders",
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      } else {
        toast.error("Không thể tải lịch sử đơn hàng");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Lỗi kết nối. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Cancel order function
  const handleCancelOrder = async (orderId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}/cancel`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        toast.success("Đơn hàng đã được hủy thành công!");
        fetchOrders(); // Refresh orders
        setShowModal(false);
      } else {
        const data = await response.json();
        toast.error(data.message || "Không thể hủy đơn hàng");
      }
    } catch (error) {
      console.error("Error canceling order:", error);
      toast.error("Lỗi kết nối. Vui lòng thử lại!");
    }
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return {
          color: "text-yellow-700 bg-yellow-100",
          icon: Clock,
          text: "Chờ xử lý",
        };
      case "confirmed":
        return {
          color: "text-blue-700 bg-blue-100",
          icon: CheckCircle,
          text: "Đã xác nhận",
        };
      case "shipped":
        return {
          color: "text-purple-700 bg-purple-100",
          icon: Truck,
          text: "Đang giao",
        };
      case "delivered":
        return {
          color: "text-green-700 bg-green-100",
          icon: CheckCircle,
          text: "Đã giao",
        };
      case "cancelled":
        return {
          color: "text-red-700 bg-red-100",
          icon: XCircle,
          text: "Đã hủy",
        };
      default:
        return {
          color: "text-gray-700 bg-gray-100",
          icon: Clock,
          text: "Không xác định",
        };
    }
  };

  // Get payment status info
  const getPaymentStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return {
          color: "text-yellow-700 bg-yellow-100",
          text: "Chờ thanh toán",
        };
      case "paid":
        return { color: "text-green-700 bg-green-100", text: "Đã thanh toán" };
      case "failed":
        return {
          color: "text-red-700 bg-red-100",
          text: "Thanh toán thất bại",
        };
      default:
        return { color: "text-gray-700 bg-gray-100", text: "Không xác định" };
    }
  };

  // Show order details modal
  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Đang tải lịch sử đơn hàng...</p>
          </div>
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
            Lịch sử đơn hàng
          </h1>
          <p className="text-gray-600">
            Theo dõi tất cả đơn hàng của bạn tại đây
          </p>
        </motion.div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-lg shadow-sm border"
          >
            <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có đơn hàng nào
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!
            </p>
            <a
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Mua sắm ngay
            </a>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const statusInfo = getStatusInfo(order.status);
              const paymentInfo = getPaymentStatusInfo(order.paymentStatus);
              const StatusIcon = statusInfo.icon;

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Package className="h-5 w-5 text-blue-600" />
                        <span className="text-gray-900 font-semibold">
                          Đơn hàng #{order._id.slice(-8)}
                        </span>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color} flex items-center gap-1`}
                        >
                          <StatusIcon className="h-4 w-4" />
                          {statusInfo.text}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span>Ngày đặt: {formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${paymentInfo.color}`}
                          >
                            {paymentInfo.text}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-600" />
                          <span>{order.items.length} sản phẩm</span>
                        </div>
                      </div>

                      <div className="text-2xl font-bold text-blue-600">
                        {formatPrice(order.totalAmount)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => showOrderDetails(order)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <Eye className="h-4 w-4" />
                        Xem chi tiết
                      </button>

                      {order.status === "pending" && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                          <X className="h-4 w-4" />
                          Hủy đơn
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Order Details Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Chi tiết đơn hàng #{selectedOrder._id.slice(-8)}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Order Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    Trạng thái đơn hàng
                  </h3>
                  <div
                    className={`px-3 py-2 rounded-full text-sm font-medium ${
                      getStatusInfo(selectedOrder.status).color
                    } inline-flex items-center gap-2`}
                  >
                    {React.createElement(
                      getStatusInfo(selectedOrder.status).icon,
                      { className: "h-4 w-4" }
                    )}
                    {getStatusInfo(selectedOrder.status).text}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    Trạng thái thanh toán
                  </h3>
                  <div
                    className={`px-3 py-2 rounded-full text-sm font-medium ${
                      getPaymentStatusInfo(selectedOrder.paymentStatus).color
                    } inline-flex`}
                  >
                    {getPaymentStatusInfo(selectedOrder.paymentStatus).text}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Địa chỉ giao hàng
                </h3>
                <div className="text-gray-700">
                  <p className="font-medium">
                    {selectedOrder.shippingAddress.fullName}
                  </p>
                  <p>{selectedOrder.shippingAddress.phone}</p>
                  <p>{selectedOrder.shippingAddress.address}</p>
                  <p>{selectedOrder.shippingAddress.city}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Sản phẩm đã đặt
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 bg-gray-50 rounded-lg p-4"
                    >
                      <img
                        src={item.product.image || "/placeholder-product.jpg"}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Số lượng: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">
                          {formatPrice(item.quantity * item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Tổng kết đơn hàng
                </h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span>Miễn phí</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                      <span>Tổng cộng:</span>
                      <span className="text-blue-600">
                        {formatPrice(selectedOrder.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Date */}
              <div className="mt-4 text-center text-sm text-gray-500">
                Đặt hàng vào {formatDate(selectedOrder.createdAt)}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default OrderHistory;
