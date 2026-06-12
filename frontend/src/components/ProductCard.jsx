import { Link } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { trackBehavior } from "../utils/behaviorTracker";

const TYPE_EMOJI = { book: "📚", laptop: "💻", fashion: "👕" };

function getSubtitle(product) {
  const d = product.detail || {};
  if (product.product_type === "book") return d.author || "";
  if (product.product_type === "laptop") return [d.brand, d.cpu, d.ram].filter(Boolean).join(" · ");
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
  const subtitle = getSubtitle(product);

  return (
    <div className="card overflow-hidden group">
      <Link to={`/products/${product.id}`} onClick={handleCardClick}>
        <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
              <span className="text-6xl text-primary-400">{emoji}</span>
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Hết hàng
              </span>
            </div>
          )}

          <span className="absolute top-2 left-2 bg-white bg-opacity-90 text-xs px-2 py-0.5 rounded-full font-medium text-gray-600">
            {emoji} {product.product_type === "book" ? "Sách" : product.product_type === "laptop" ? "Laptop" : "Thời trang"}
          </span>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-800 line-clamp-2 min-h-[48px] group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
          {subtitle && (
            <p className="text-gray-500 text-sm mt-1 line-clamp-1">{subtitle}</p>
          )}

          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-primary-600">
              {formatPrice(product.price)}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="p-2 rounded-full bg-primary-100 text-primary-600 hover:bg-primary-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
