import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { FiFilter, FiX, FiStar } from "react-icons/fi";
import { productService, catalogService } from "../services";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import RecommendationSection from "../components/RecommendationSection";

const PRODUCT_TYPES = [
  { key: "electronics", label: "Điện tử" },
  { key: "book", label: "Sách" },
  { key: "fashion", label: "Thời trang" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_low", label: "Giá: thấp đến cao" },
  { value: "price_high", label: "Giá: cao đến thấp" },
];

const MAX_PRICE = 100_000_000;

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { customer } = useAuth();

  // URL params
  const productType = searchParams.get("type") || "";
  const catalogId = searchParams.get("catalog");
  const searchQuery = searchParams.get("search");
  const sortBy = searchParams.get("sort") || "newest";

  // Local filter state
  const [selectedTypes, setSelectedTypes] = useState(productType ? [productType] : []);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(MAX_PRICE);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);

  // Fetch catalogs filtered by type
  useEffect(() => {
    catalogService.getAll().then((res) => {
      const all = res.data.results || res.data || [];
      setCatalogs(productType ? all.filter((c) => c.product_type === productType) : all);
    }).catch(() => {});
  }, [productType]);

  // Fetch products
  useEffect(() => {
    setLoading(true);
    const params = {};
    if (productType) params.product_type = productType;
    if (catalogId) params.catalog_id = catalogId;
    if (searchQuery) params.search = searchQuery;
    if (sortBy === "newest") params.ordering = "-created_at";
    if (sortBy === "price_low") params.ordering = "price";
    if (sortBy === "price_high") params.ordering = "-price";

    productService.getAll(params)
      .then((res) => setAllProducts(res.data.results || res.data || []))
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false));
  }, [productType, catalogId, searchQuery, sortBy]);

  // Sync URL type with local checkbox state
  useEffect(() => {
    setSelectedTypes(productType ? [productType] : []);
  }, [productType]);

  // Client-side filtering
  const products = useMemo(() => {
    return allProducts.filter((p) => {
      if (selectedTypes.length > 0 && !selectedTypes.includes(p.product_type)) return false;
      const price = Number(p.price);
      if (price < priceMin || price > priceMax) return false;
      if (inStockOnly && p.stock <= 0) return false;
      return true;
    });
  }, [allProducts, selectedTypes, priceMin, priceMax, inStockOnly]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  };

  const toggleType = (type) => {
    // Also update URL
    if (selectedTypes.includes(type)) {
      setSelectedTypes([]);
      setParam("type", "");
    } else {
      setSelectedTypes([type]);
      setParam("type", type);
      setParam("catalog", ""); // reset catalog when switching type
    }
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setPriceMin(0);
    setPriceMax(MAX_PRICE);
    setInStockOnly(false);
    setMinRating(0);
    setSearchParams({});
  };

  const pageTitle = searchQuery
    ? `Kết quả cho "${searchQuery}"`
    : productType === "book" ? "Sách"
    : productType === "electronics" ? "Đồ điện tử"
    : productType === "fashion" ? "Thời trang"
    : "Tất cả sản phẩm";

  const formatPrice = (v) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

  const Sidebar = () => (
    <aside className="w-64 flex-shrink-0">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 font-semibold text-gray-800">
            <FiFilter className="w-4 h-4" />
            Bộ lọc
          </div>
          <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Xóa tất cả
          </button>
        </div>

        {/* Category (product type) */}
        <div className="px-4 py-4 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Loại sản phẩm</p>
          <div className="space-y-2">
            {PRODUCT_TYPES.map((t) => (
              <label key={t.key} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(t.key)}
                  onChange={() => toggleType(t.key)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                  {t.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Sub-category */}
        {catalogs.length > 0 && (
          <div className="px-4 py-4 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Danh mục</p>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={!catalogId}
                  onChange={() => setParam("catalog", "")}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-blue-600">Tất cả</span>
              </label>
              {catalogs.map((c) => (
                <label key={c.id} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={catalogId == c.id}
                    onChange={() => setParam("catalog", catalogId == c.id ? "" : c.id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-blue-600">
                    {c.icon} {c.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Price range */}
        <div className="px-4 py-4 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Khoảng giá</p>
          <p className="text-xs text-gray-400 mb-3">{formatPrice(priceMin)} – {formatPrice(priceMax)}</p>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tối thiểu</label>
              <input
                type="range"
                min={0}
                max={MAX_PRICE}
                step={100000}
                value={priceMin}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v <= priceMax) setPriceMin(v);
                }}
                className="w-full h-1.5 appearance-none bg-blue-200 rounded accent-blue-600 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tối đa</label>
              <input
                type="range"
                min={0}
                max={MAX_PRICE}
                step={100000}
                value={priceMax}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v >= priceMin) setPriceMax(v);
                }}
                className="w-full h-1.5 appearance-none bg-blue-200 rounded accent-blue-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* In stock only */}
        <div className="px-4 py-4 border-b border-gray-100">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Chỉ còn hàng</span>
          </label>
        </div>

        {/* Minimum rating */}
        <div className="px-4 py-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Đánh giá tối thiểu</p>
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value={0}>Tất cả đánh giá</option>
            <option value={4}>⭐⭐⭐⭐ trở lên (4+)</option>
            <option value={3}>⭐⭐⭐ trở lên (3+)</option>
            <option value={2}>⭐⭐ trở lên (2+)</option>
          </select>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">

        {/* Page title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-5">{pageTitle}</h1>

        <div className="flex gap-6">
          {/* Sidebar — desktop */}
          <div className="hidden md:block">
            <Sidebar />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                Hiển thị <span className="font-semibold text-gray-700">{products.length}</span> sản phẩm
              </p>

              <div className="flex items-center gap-2">
                {/* Mobile filter button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="md:hidden flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FiFilter className="w-4 h-4" /> Bộ lọc
                </button>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setParam("sort", e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product grid */}
            {loading ? (
              <Loading />
            ) : products.length === 0 ? (
              <EmptyState
                title="Không tìm thấy sản phẩm"
                description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
              />
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
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

      {/* Mobile filter overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-gray-50 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-4 py-4 bg-white border-b">
              <span className="font-semibold text-gray-800">Bộ lọc</span>
              <button onClick={() => setShowMobileFilters(false)}>
                <FiX className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-4">
              <Sidebar />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
