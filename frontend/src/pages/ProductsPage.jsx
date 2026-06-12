import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FiFilter, FiGrid, FiList } from "react-icons/fi";
import { productService, catalogService } from "../services";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import RecommendationSection from "../components/RecommendationSection";

const TYPE_TABS = [
  { key: "", label: "Tất cả" },
  { key: "book", label: "📚 Sách" },
  { key: "laptop", label: "💻 Laptop" },
  { key: "fashion", label: "👕 Quần áo" },
];

const TYPE_EMOJI = { book: "📚", laptop: "💻", fashion: "👕" };

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const { customer } = useAuth();

  const productType = searchParams.get("type") || "";
  const catalogId = searchParams.get("catalog");
  const searchQuery = searchParams.get("search");
  const sortBy = searchParams.get("sort") || "newest";

  useEffect(() => {
    catalogService.getAll().then((res) => {
      const all = res.data.results || res.data || [];
      setCatalogs(productType ? all.filter((c) => c.product_type === productType) : all);
    }).catch(() => {});
  }, [productType]);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (productType) params.product_type = productType;
    if (catalogId) params.catalog_id = catalogId;
    if (searchQuery) params.search = searchQuery;
    if (sortBy === "newest") params.ordering = "-created_at";
    if (sortBy === "price_low") params.ordering = "price";
    if (sortBy === "price_high") params.ordering = "-price";

    productService.getAll(params).then((res) => {
      setProducts(res.data.results || res.data || []);
    }).catch(() => setProducts([])).finally(() => setLoading(false));
  }, [productType, catalogId, searchQuery, sortBy]);

  const setType = (type) => {
    const next = new URLSearchParams(searchParams);
    if (type) next.set("type", type); else next.delete("type");
    next.delete("catalog");
    setSearchParams(next);
  };

  const setCatalog = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id) next.set("catalog", id); else next.delete("catalog");
    setSearchParams(next);
  };

  const setSort = (sort) => {
    const next = new URLSearchParams(searchParams);
    next.set("sort", sort);
    setSearchParams(next);
  };

  const pageTitle = searchQuery
    ? `Kết quả: "${searchQuery}"`
    : productType === "book" ? "Sách" : productType === "laptop" ? "Laptop" : productType === "fashion" ? "Thời trang" : "Tất cả sản phẩm";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Type tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setType(tab.key)}
            className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
              productType === tab.key
                ? "bg-primary-600 text-white shadow"
                : "bg-white text-gray-600 border hover:border-primary-400 hover:text-primary-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{pageTitle}</h1>
          <p className="text-gray-500 mt-1">{products.length} sản phẩm</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSort(e.target.value)}
            className="input-field w-auto"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_low">Giá thấp - cao</option>
            <option value="price_high">Giá cao - thấp</option>
          </select>

          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${viewMode === "grid" ? "bg-primary-600 text-white" : "bg-white text-gray-600"}`}
            >
              <FiGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${viewMode === "list" ? "bg-primary-600 text-white" : "bg-white text-gray-600"}`}
            >
              <FiList className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden p-2 border rounded-lg"
          >
            <FiFilter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar — danh mục */}
        <aside className={`w-56 flex-shrink-0 ${showFilters ? "block" : "hidden"} md:block`}>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Danh mục</h3>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setCatalog(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                    !catalogId ? "bg-primary-100 text-primary-700 font-medium" : "hover:bg-gray-100"
                  }`}
                >
                  Tất cả
                </button>
              </li>
              {catalogs.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setCatalog(c.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                      catalogId == c.id ? "bg-primary-100 text-primary-700 font-medium" : "hover:bg-gray-100"
                    }`}
                  >
                    {c.icon} {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Product grid / list */}
        <div className="flex-grow">
          {loading ? (
            <Loading />
          ) : products.length === 0 ? (
            <EmptyState
              title="Không tìm thấy sản phẩm"
              description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
            />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((p) => (
                <ProductListItem key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      <RecommendationSection
        userId={customer?.id?.toString() || ""}
        title={searchQuery ? `Gợi ý liên quan đến "${searchQuery}"` : "Gợi ý cho bạn"}
      />
    </div>
  );
}

function ProductListItem({ product }) {
  const { addItem } = useCart();
  const emoji = { book: "📚", laptop: "💻", fashion: "👕" }[product.product_type] || "🛍️";

  const formatPrice = (p) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p);

  const d = product.detail || {};
  let subtitle = "";
  if (product.product_type === "book") subtitle = d.author || "";
  if (product.product_type === "laptop") subtitle = [d.brand, d.cpu, d.ram].filter(Boolean).join(" · ");
  if (product.product_type === "fashion") subtitle = [d.brand, d.material].filter(Boolean).join(" · ");

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm flex gap-4">
      <div className="w-28 h-36 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
            <span className="text-4xl">{emoji}</span>
          </div>
        )}
      </div>
      <div className="flex-grow">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {emoji} {product.product_type === "book" ? "Sách" : product.product_type === "laptop" ? "Laptop" : "Thời trang"}
          </span>
        </div>
        <h3 className="font-semibold text-gray-800 text-lg">{product.name}</h3>
        {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{product.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-primary-600">{formatPrice(product.price)}</span>
          <button
            onClick={() => addItem(product.id)}
            disabled={product.stock === 0}
            className="btn-primary"
          >
            {product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ"}
          </button>
        </div>
      </div>
    </div>
  );
}
