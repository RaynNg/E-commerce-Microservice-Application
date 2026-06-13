import { Link } from "react-router-dom";
import { FiShoppingCart, FiHeart } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { trackBehavior } from "../utils/behaviorTracker";

const TYPE_LABEL = {
  book: "Sách",
  electronics: "Điện tử",
  fashion: "Thời trang",
};

const TYPE_EMOJI = {
  book: "📚",
  electronics: "🖥️",
  fashion: "👕",
};

// Deterministic mock rating từ product.id (3.0 – 5.0)
function mockRating(id) {
  return (((id * 37 + 11) % 21) / 10 + 3.0).toFixed(1);
}

// Deterministic mock review count (50 – 2000)
function mockReviews(id) {
  return ((id * 127 + 43) % 1951) + 50;
}

function getSubtitle(product) {
  const d = product.detail || {};
  if (product.product_type === "book") return d.author || "";
  if (product.product_type === "electronics") return d.brand || (d.specs && d.specs.cpu ? d.specs.cpu : "");
  if (product.product_type === "fashion") return [d.brand, d.material].filter(Boolean).join(" · ");
  return "";
}

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { customer } = useAuth();

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await addItem(product.id);
    trackBehavior(customer?.id, product.id, "add_to_cart");
  };

  const handleCardClick = () => {
    trackBehavior(customer?.id, product.id, "view");
  };

  const emoji = TYPE_EMOJI[product.product_type] || "🛍️";
  const label = TYPE_LABEL[product.product_type] || "Sản phẩm";
  const subtitle = getSubtitle(product);
  const rating = mockRating(product.id);
  const reviews = mockReviews(product.id);
  const outOfStock = product.stock === 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">

      {/* Image area */}
      <Link to={`/products/${product.id}`} onClick={handleCardClick} className="relative block">
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
              <span className="text-5xl opacity-60">{emoji}</span>
            </div>
          )}

          {/* Wishlist button */}
          <button
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white hover:text-red-500 transition-colors text-gray-400"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <FiHeart className="w-4 h-4" />
          </button>

          {/* Out of stock overlay */}
          {outOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                Hết hàng
              </span>
            </div>
          )}
        </div>

        {/* Category + rating row */}
        <div className="flex items-center justify-between px-3 pt-2.5">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {label}
          </span>
          <div className="flex items-center gap-1 text-amber-500">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-semibold text-gray-700">{rating}</span>
          </div>
        </div>
      </Link>

      {/* Card body */}
      <div className="px-3 pb-3 pt-1.5 flex flex-col flex-1">
        <Link to={`/products/${product.id}`} onClick={handleCardClick}>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[40px] hover:text-blue-600 transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {subtitle && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{subtitle}</p>
        )}

        <p className="text-xs text-gray-400 mt-0.5">
          {reviews.toLocaleString("vi-VN")} đánh giá đã xác nhận
        </p>

        {/* Price + cart */}
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <span className="text-base font-bold text-gray-900 leading-none">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="flex-shrink-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white disabled:text-gray-400 rounded-lg flex items-center justify-center transition-colors disabled:cursor-not-allowed"
          >
            <FiShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
