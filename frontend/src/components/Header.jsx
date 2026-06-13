import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiX,
  FiSearch,
  FiLogOut,
  FiPackage,
  FiChevronDown,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const NAV_LINKS = [
  { to: "/products?type=electronics", label: "Điện tử" },
  { to: "/products?type=book", label: "Sách" },
  { to: "/products?type=fashion", label: "Thời trang" },
  { to: "/products", label: "Khuyến mãi" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const userMenuRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const { customer, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 shadow-md">

      {/* ── Announcement bar ─────────────────────────────────── */}
      <div className="bg-blue-700 text-white text-xs py-2 text-center tracking-wide">
        Miễn phí vận chuyển cho đơn hàng trên 500.000₫ &nbsp;·&nbsp; Thanh toán bảo mật &nbsp;·&nbsp; Đổi trả trong 30 ngày
      </div>

      {/* ── Main header ──────────────────────────────────────── */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">ShopMicro</span>
          </Link>

          {/* Search — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm, thương hiệu và danh mục..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-5 pr-12 py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <FiSearch className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto md:ml-0">
            {isAuthenticated ? (
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                >
                  <FiUser className="w-5 h-5" />
                  <span className="font-medium">{customer?.first_name || "Tài khoản"}</span>
                  <FiChevronDown className={`w-3.5 h-3.5 transition-transform ${isUserOpen ? "rotate-180" : ""}`} />
                </button>

                {isUserOpen && (
                  <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border py-1 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setIsUserOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <FiUser className="w-4 h-4 text-gray-400" /> Tài khoản của tôi
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setIsUserOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <FiPackage className="w-4 h-4 text-gray-400" /> Đơn hàng
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={() => { setIsUserOpen(false); handleLogout(); }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <FiLogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium">
                <FiUser className="w-5 h-5" /> Đăng nhập
              </Link>
            )}

            <Link to="/cart" className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium">
              <FiShoppingCart className="w-5 h-5" />
              <span className="hidden md:block">Giỏ hàng</span>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 left-6 md:left-auto md:relative md:top-0 bg-blue-600 text-white text-xs min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 font-semibold">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="md:hidden px-4 pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-5 pr-12 py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FiSearch className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* ── Category nav bar ─────────────────────────────────── */}
      <div className="bg-white border-t border-gray-100 hidden md:block">
        <div className="container mx-auto px-4 flex items-center justify-between">

          {/* Left: All categories + nav links */}
          <div className="flex items-center">
            {/* All categories dropdown */}
            <div className="relative" onMouseEnter={() => setIsCatOpen(true)} onMouseLeave={() => setIsCatOpen(false)}>
              <button className="flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                <span>Tất cả danh mục</span>
                <FiChevronDown className="w-4 h-4" />
              </button>
              {isCatOpen && (
                <div className="absolute left-0 top-full w-52 bg-white shadow-xl border rounded-b-xl py-2 z-50">
                  <Link to="/products" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">🛍️ Tất cả sản phẩm</Link>
                  <Link to="/products?type=electronics" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">🖥️ Đồ điện tử</Link>
                  <Link to="/products?type=book" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">📚 Sách</Link>
                  <Link to="/products?type=fashion" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">👕 Thời trang</Link>
                </div>
              )}
            </div>

            {/* Nav links */}
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: Track orders */}
          <Link to="/orders" className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors my-1.5">
            <FiPackage className="w-4 h-4" />
            Theo dõi đơn hàng
          </Link>
        </div>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────── */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <nav className="container mx-auto px-4 py-4 space-y-1">
            <Link to="/products" className="block px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg font-medium text-sm" onClick={() => setIsMenuOpen(false)}>
              🛍️ Tất cả sản phẩm
            </Link>
            <Link to="/products?type=electronics" className="block px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg font-medium text-sm" onClick={() => setIsMenuOpen(false)}>
              🖥️ Điện tử
            </Link>
            <Link to="/products?type=book" className="block px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg font-medium text-sm" onClick={() => setIsMenuOpen(false)}>
              📚 Sách
            </Link>
            <Link to="/products?type=fashion" className="block px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg font-medium text-sm" onClick={() => setIsMenuOpen(false)}>
              👕 Thời trang
            </Link>
            <hr className="my-2" />
            <Link to="/orders" className="block px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg font-medium text-sm" onClick={() => setIsMenuOpen(false)}>
              <FiPackage className="inline w-4 h-4 mr-2" />Theo dõi đơn hàng
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="block px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg text-sm" onClick={() => setIsMenuOpen(false)}>Tài khoản</Link>
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg text-sm">
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link to="/login" className="block px-3 py-2.5 text-blue-600 font-medium text-sm" onClick={() => setIsMenuOpen(false)}>
                Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
