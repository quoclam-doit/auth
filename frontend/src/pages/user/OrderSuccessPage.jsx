import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import UserLayout from "../../components/user/UserLayout";
import {
  CheckCircle,
  Package,
  Clock,
  MapPin,
  CreditCard,
  ArrowRight,
  Home,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError("Không tìm thấy thông tin đơn hàng");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/orders/${orderId}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Không thể tải thông tin đơn hàng");
        }

        const orderData = await response.json();
        setOrder(orderData);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const getStatusText = (status) => {
    const statusMap = {
      pending: "Chờ xử lý",
      processing: "Đang xử lý",
      shipped: "Đã gửi",
      delivered: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const getPaymentMethodText = (method) => {
    const methodMap = {
      cod: "Thanh toán khi nhận hàng (COD)",
      bank_transfer: "Chuyển khoản ngân hàng",
      e_wallet: "Ví điện tử",
    };
    return methodMap[method] || method;
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (error || !order) {
    return (
      <UserLayout>
        <div className="py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Có lỗi xảy ra
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-x-4">
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Home className="w-5 h-5 mr-2" />
                Về trang chủ
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Đặt hàng thành công!
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Cảm ơn bạn đã tin tưởng và mua sắm tại E-Shop
            </p>
            <div className="bg-blue-50 rounded-lg p-4 inline-block">
              <p className="text-sm text-gray-600">Mã đơn hàng của bạn</p>
              <p className="text-2xl font-bold text-blue-600">
                {order.orderNumber}
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Trạng thái đơn hàng
                </h2>
                <div className="flex items-center">
                  <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    {getStatusText(order.status)}
                  </div>
                  <div className="ml-4 text-sm text-gray-600">
                    Đặt hàng lúc:{" "}
                    {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </div>
                </div>
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    📞 Chúng tôi sẽ liên hệ với bạn trong vòng 24h để xác nhận
                    đơn hàng
                  </p>
                </div>
              </motion.div>

              {/* Order Items */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-blue-600" />
                  Sản phẩm đã đặt ({order.items?.length || 0})
                </h2>
                <div className="space-y-4">
                  {order.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                    >
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
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {item.productName}
                        </h3>
                        {item.variant &&
                          (item.variant.color || item.variant.size) && (
                            <p className="text-sm text-gray-600">
                              {item.variant.color &&
                                `Màu: ${item.variant.color}`}
                              {item.variant.color && item.variant.size && " - "}
                              {item.variant.size &&
                                `Size: ${item.variant.size}`}
                            </p>
                          )}
                        <p className="text-sm text-gray-600">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {(item.price * item.quantity).toLocaleString("vi-VN")}
                          đ
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.price.toLocaleString("vi-VN")}đ/sp
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* What's Next */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-blue-50 rounded-lg p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Điều gì sẽ diễn ra tiếp theo?
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Xác nhận đơn hàng
                      </p>
                      <p className="text-sm text-gray-600">
                        Chúng tôi sẽ gọi điện xác nhận trong 24h
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-gray-300 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Chuẩn bị hàng</p>
                      <p className="text-sm text-gray-600">
                        Đóng gói và chuẩn bị giao hàng (1-2 ngày)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-gray-300 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Giao hàng</p>
                      <p className="text-sm text-gray-600">
                        Nhận hàng và thanh toán (2-5 ngày)
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                  Tổng kết đơn hàng
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-medium">
                      {order.totalAmount?.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="font-medium">
                      {order.shippingFee?.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá:</span>
                      <span>
                        -{order.discountAmount?.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Tổng cộng:</span>
                      <span className="text-blue-600">
                        {order.finalAmount?.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 font-medium">
                    Phương thức thanh toán:
                  </p>
                  <p className="text-sm text-gray-600">
                    {getPaymentMethodText(order.paymentMethod)}
                  </p>
                </div>
              </motion.div>

              {/* Shipping Address */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Địa chỉ giao hàng
                </h2>
                <div className="text-sm space-y-1">
                  <p className="font-medium text-gray-900">
                    {order.shippingAddress?.fullName}
                  </p>
                  <p className="text-gray-600">
                    {order.shippingAddress?.phone}
                  </p>
                  <p className="text-gray-600">
                    {order.shippingAddress?.address}
                    <br />
                    {order.shippingAddress?.ward},{" "}
                    {order.shippingAddress?.district}
                    <br />
                    {order.shippingAddress?.city}
                  </p>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="space-y-3"
              >
                <Link
                  to="/orders"
                  className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Xem lịch sử đơn hàng
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>

                <Link
                  to="/products"
                  className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Tiếp tục mua sắm
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default OrderSuccessPage;
