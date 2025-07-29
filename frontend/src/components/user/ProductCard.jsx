import React, { useState } from "react";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";
import toast from "react-hot-toast";

const ProductCard = ({ product, index }) => {
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCartStore();

  const getStatusBadge = (status, inventory) => {
    if (inventory <= 0) {
      return { text: "Hết hàng", class: "bg-red-100 text-red-800" };
    }
    if (status === "available") {
      return { text: "Còn hàng", class: "bg-green-100 text-green-800" };
    }
    return { text: "Ngưng bán", class: "bg-gray-100 text-gray-800" };
  };

  const handleAddToCart = async () => {
    if (product.inventory <= 0) {
      toast.error("Sản phẩm đã hết hàng!");
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product, 1); // Mặc định thêm 1 sản phẩm
      toast.success(`Đã thêm ${product.productName} vào giỏ hàng!`);
    } catch (error) {
      toast.error(error.message || "Không thể thêm vào giỏ hàng!");
    } finally {
      setIsAdding(false);
    }
  };

  const statusBadge = getStatusBadge(product.status, product.inventory);
  const isAvailable = product.status === "available" && product.inventory > 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group h-full flex flex-col">
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <img
          src={
            product.image
              ? `http://localhost:5000/${product.image.replace(/\\/g, "/")}`
              : "/placeholder-image.jpg"
          }
          alt={product.productName}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Status Badge */}
        <div
          className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.class}`}
        >
          {statusBadge.text}
        </div>

        {/* Quick Actions - Show on hover */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
            title="Thêm vào yêu thích"
          >
            <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
          </button>
          <Link
            to={`/products/${product._id}`}
            className="p-2 bg-white rounded-full shadow-md hover:bg-blue-50 transition-colors"
            title="Xem chi tiết"
          >
            <Eye className="w-4 h-4 text-gray-600 hover:text-blue-500" />
          </Link>
        </div>

        {/* Out of stock overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {product.inventory <= 0 ? "Hết hàng" : "Ngưng bán"}
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/products/${product._id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2 min-h-[3rem]">
            {product.productName}
          </h3>
        </Link>

        {/* Price */}
        <div className="mb-3">
          <span className="text-xl font-bold text-green-600">
            {product.price?.toLocaleString("vi-VN")}đ
          </span>
        </div>

        {/* Variants Preview */}
        <div className="mb-3 min-h-[3rem]">
          {product.variant && product.variant.length > 0 ? (
            <>
              <div className="text-sm text-gray-500 mb-1">Màu sắc:</div>
              <div className="flex flex-wrap gap-1">
                {product.variant.slice(0, 3).map((variant, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                  >
                    {variant.color}
                  </span>
                ))}
                {product.variant.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{product.variant.length - 3}
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-400">Không có biến thể</div>
          )}
        </div>

        {/* Inventory */}
        <div className="text-sm text-gray-500 mb-4">
          Còn lại: {product.inventory} sản phẩm
        </div>

        {/* Add to Cart Button - Simple without quantity */}
        <div className="mt-auto">
          <button
            onClick={handleAddToCart}
            disabled={!isAvailable || isAdding}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
              !isAvailable
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : isAdding
                ? "bg-blue-500 text-white cursor-wait"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isAdding ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang thêm...
              </>
            ) : !isAvailable ? (
              "Không thể mua"
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Thêm vào giỏ
              </>
            )}
          </button>
        </div>

        {/* Inventory Warning */}
        {isAvailable && product.inventory <= 5 && (
          <p className="text-xs text-orange-600 mt-2 text-center">
            ⚠️ Chỉ còn {product.inventory} sản phẩm
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
