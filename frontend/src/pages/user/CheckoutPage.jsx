import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../components/user/UserLayout";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import {
  CreditCard,
  MapPin,
  User,
  Package,
  ArrowLeft,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart, isLoading } = useCartStore();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    // Customer info
    fullName: user?.name || "",
    phone: "",
    email: user?.email || "",

    // Shipping address
    address: "",
    city: "",
    district: "",
    ward: "",

    // Payment & Notes
    paymentMethod: "cod",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
      toast.error("Giỏ hàng trống");
    }
  }, [items, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    const requiredFields = {
      fullName: "Họ và tên",
      phone: "Số điện thoại",
      email: "Email",
      address: "Địa chỉ",
      city: "Tỉnh/Thành phố",
      district: "Quận/Huyện",
      ward: "Phường/Xã",
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData[field].trim()) {
        newErrors[field] = `${label} là bắt buộc`;
      }
    });

    // Phone validation
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data
      const orderData = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          variant: {
            color: item.variant?.color || "",
            size: item.variant?.size || "",
          },
        })),
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          district: formData.district,
          ward: formData.ward,
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        shippingFee: 30000,
        discountAmount: 0,
      };

      // Create order
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Không thể tạo đơn hàng");
      }

      // Clear cart and redirect to success page
      clearCart();
      toast.success("Đặt hàng thành công!");
      navigate(`/order-success/${result.order._id}`);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Có lỗi xảy ra khi đặt hàng");
    } finally {
      setIsSubmitting(false);
    }
  };

  const shippingFee = 30000;
  const total = getCartTotal();
  const finalTotal = total + shippingFee;

  if (items.length === 0) {
    return null; // Will redirect
  }

  return (
    <UserLayout>
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate("/cart")}
              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại giỏ hàng
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              {/* Main Form */}
              <div className="lg:col-span-8 space-y-8">
                {/* Customer Information */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Thông tin khách hàng
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.fullName ? "border-red-300" : "border-gray-300"
                        }`}
                      />
                      {errors.fullName && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.phone ? "border-red-300" : "border-gray-300"
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.email ? "border-red-300" : "border-gray-300"
                        }`}
                      />
                      {errors.email && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                    Địa chỉ giao hàng
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ cụ thể *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Số nhà, tên đường..."
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.address ? "border-red-300" : "border-gray-300"
                        }`}
                      />
                      {errors.address && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors.address}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phường/Xã *
                        </label>
                        <input
                          type="text"
                          name="ward"
                          value={formData.ward}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.ward ? "border-red-300" : "border-gray-300"
                          }`}
                        />
                        {errors.ward && (
                          <p className="text-red-600 text-xs mt-1">
                            {errors.ward}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quận/Huyện *
                        </label>
                        <input
                          type="text"
                          name="district"
                          value={formData.district}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.district
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.district && (
                          <p className="text-red-600 text-xs mt-1">
                            {errors.district}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tỉnh/Thành phố *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.city ? "border-red-300" : "border-gray-300"
                          }`}
                        />
                        {errors.city && (
                          <p className="text-red-600 text-xs mt-1">
                            {errors.city}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                    Phương thức thanh toán
                  </h2>

                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === "cod"}
                        onChange={handleInputChange}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">
                          Thanh toán khi nhận hàng (COD)
                        </div>
                        <div className="text-sm text-gray-600">
                          Thanh toán bằng tiền mặt khi nhận hàng
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 opacity-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        disabled
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">
                          Chuyển khoản ngân hàng
                        </div>
                        <div className="text-sm text-gray-600">Sắp ra mắt</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Ghi chú đơn hàng
                  </h2>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Ghi chú thêm cho đơn hàng (tùy chọn)"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-4 mt-8 lg:mt-0">
                <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-blue-600" />
                    Đơn hàng của bạn
                  </h2>

                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center space-x-3"
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
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.productName}
                          </p>
                          <p className="text-xs text-gray-600">
                            SL: {item.quantity} ×{" "}
                            {item.price.toLocaleString("vi-VN")}đ
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {(item.price * item.quantity).toLocaleString("vi-VN")}
                          đ
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Price Summary */}
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tạm tính</span>
                      <span className="font-medium">
                        {total.toLocaleString("vi-VN")}đ
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phí vận chuyển</span>
                      <span className="font-medium">
                        {shippingFee.toLocaleString("vi-VN")}đ
                      </span>
                    </div>

                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                      <span>Tổng cộng</span>
                      <span className="text-blue-600">
                        {finalTotal.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      "Đang xử lý..."
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Đặt hàng
                      </>
                    )}
                  </button>

                  {/* Security Note */}
                  <p className="text-xs text-gray-500 mt-4 text-center">
                    🔒 Thông tin của bạn được mã hóa và bảo mật
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </UserLayout>
  );
};

export default CheckoutPage;
