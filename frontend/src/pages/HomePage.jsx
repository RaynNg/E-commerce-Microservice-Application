import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiTruck,
  FiShield,
  FiHeadphones,
  FiRefreshCw,
} from "react-icons/fi";
import { productService, catalogService } from "../services";
import ProductCard from "../components/ProductCard";
import Loading from "../components/Loading";

// ── Dữ liệu tĩnh ────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: FiTruck,       title: "Miễn phí vận chuyển",  desc: "Đơn hàng từ 500.000₫" },
  { icon: FiShield,      title: "Thanh toán bảo mật",   desc: "Mã hóa SSL 256-bit" },
  { icon: FiRefreshCw,   title: "Đổi trả 30 ngày",      desc: "Không cần giải thích" },
  { icon: FiHeadphones,  title: "Hỗ trợ 24/7",          desc: "Chat & hotline miễn phí" },
];

const MAIN_CATEGORIES = [
  {
    type: "book",
    label: "Sách",
    emoji: "📚",
    tagline: "Hơn 1.000 đầu sách hay",
    gradient: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
  },
  {
    type: "electronics",
    label: "Đồ điện tử",
    emoji: "🖥️",
    tagline: "Laptop · Điện thoại · Tai nghe",
    gradient: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
  },
  {
    type: "fashion",
    label: "Thời trang",
    emoji: "👗",
    tagline: "Nam · Nữ · Phụ kiện",
    gradient: "from-pink-400 to-rose-500",
    bg: "bg-pink-50",
    border: "border-pink-200",
    badge: "bg-pink-100 text-pink-700",
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [catalogs, setCatalogs]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      productService.getAll({ ordering: "-created_at", limit: 8 }),
      catalogService.getAll(),
    ])
      .then(([productsRes, catalogsRes]) => {
        setFeatured(productsRes.data.results || productsRes.data || []);
        setCatalogs(catalogsRes.data.results || catalogsRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10">

          {/* Text */}
          <div className="flex-1 max-w-xl">
            <span className="inline-block text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full mb-4 tracking-wide">
              🎉 Mua sắm thông minh mỗi ngày
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Mua sắm dễ dàng —<br />
              <span className="text-blue-200">Giao hàng nhanh chóng</span>
            </h1>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
              Hàng nghìn sản phẩm chính hãng — sách, điện tử, thời trang — với giá cạnh tranh và giao hàng toàn quốc.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/products"
                className="bg-white text-blue-700 px-7 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-md"
              >
                Mua sắm ngay
              </Link>
              <Link
                to="/products?sort=newest"
                className="border-2 border-white/60 text-white px-7 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
              >
                Hàng mới về
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── Features bar ─────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{f.title}</p>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main category showcase ────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Danh mục chính</h2>
          <Link to="/products" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            Xem tất cả <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {MAIN_CATEGORIES.map((c) => (
            <Link
              key={c.type}
              to={`/products?type=${c.type}`}
              className="group relative rounded-2xl overflow-hidden border border-gray-100 bg-white hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              {/* Gradient header */}
              <div className={`bg-gradient-to-br ${c.gradient} h-32 flex items-center justify-center`}>
                <span className="text-7xl drop-shadow-sm group-hover:scale-110 transition-transform duration-200">
                  {c.emoji}
                </span>
              </div>
              {/* Body */}
              <div className="p-4">
                <h3 className="font-bold text-gray-800 text-lg">{c.label}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{c.tagline}</p>
                <span className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 font-medium group-hover:gap-2 transition-all">
                  Khám phá <FiArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Sub-category chips ────────────────────────────────────────────── */}
      {catalogs.length > 0 && (
        <section className="container mx-auto px-4 pb-10">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Danh mục phổ biến</h2>
          <div className="flex flex-wrap gap-2">
            {catalogs.slice(0, 16).map((c) => (
              <Link
                key={c.id}
                to={`/products?type=${c.product_type}&catalog=${c.id}`}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured products ─────────────────────────────────────────────── */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Sản phẩm mới nhất</h2>
            <Link to="/products?sort=newest" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Xem tất cả <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <Loading />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.slice(0, 8).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Promo banners ─────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/products?type=electronics" className="group rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white hover:shadow-xl transition-all hover:-translate-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-1">Mới về</p>
            <h3 className="text-xl font-bold mb-1">Laptop & Điện thoại</h3>
            <p className="text-blue-100 text-sm mb-4">Cấu hình mạnh · Giá tốt · Bảo hành chính hãng</p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-white group-hover:gap-2 transition-all">
              Mua ngay <FiArrowRight className="w-4 h-4" />
            </span>
          </Link>

          <Link to="/products?type=book" className="group rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-6 text-white hover:shadow-xl transition-all hover:-translate-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-100 mb-1">Bestseller</p>
            <h3 className="text-xl font-bold mb-1">Sách nổi bật</h3>
            <p className="text-orange-100 text-sm mb-4">Lập trình · Kinh tế · Văn học · Kỹ năng</p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-white group-hover:gap-2 transition-all">
              Khám phá <FiArrowRight className="w-4 h-4" />
            </span>
          </Link>

          <Link to="/products?type=fashion" className="group rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 p-6 text-white hover:shadow-xl transition-all hover:-translate-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-pink-100 mb-1">Xu hướng</p>
            <h3 className="text-xl font-bold mb-1">Thời trang mới</h3>
            <p className="text-pink-100 text-sm mb-4">Nam · Nữ · Giày dép · Phụ kiện</p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-white group-hover:gap-2 transition-all">
              Mua sắm <FiArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </section>

      {/* ── Newsletter ────────────────────────────────────────────────────── */}
      <section className="bg-blue-700 py-14">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Đăng ký nhận ưu đãi</h2>
          <p className="text-blue-200 mb-8 max-w-lg mx-auto">
            Nhận thông báo sản phẩm mới và mã giảm giá hấp dẫn trực tiếp vào email của bạn.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Nhập địa chỉ email..."
              className="flex-1 px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
            />
            <button
              type="submit"
              className="bg-white text-blue-700 px-7 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-sm"
            >
              Đăng ký
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
