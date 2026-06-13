import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiMinus, FiPlus, FiShoppingCart, FiHeart, FiShare2, FiStar } from "react-icons/fi";
import { productService, commentService } from "../services";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { trackBehavior } from "../utils/behaviorTracker";
import Loading from "../components/Loading";
import { toast } from "react-toastify";

const TYPE_EMOJI = { book: "📚", electronics: "🖥️", fashion: "👕" };
const TYPE_LABEL = { book: "Sách", electronics: "Đồ điện tử", fashion: "Thời trang" };

function BookMeta({ detail }) {
  if (!detail) return null;
  const rows = [
    ["Tác giả", detail.author],
    ["Nhà xuất bản", detail.publisher],
    ["ISBN", detail.isbn],
    ["Số trang", detail.pages],
    ["Ngôn ngữ", detail.language],
    ["Năm xuất bản", detail.published_year],
  ].filter(([, v]) => v);
  return <MetaTable rows={rows} />;
}

function ElectronicsMeta({ detail }) {
  if (!detail) return null;
  const specs = detail.specs || {};
  const rows = [
    ["Hãng", detail.brand],
    ["Loại", detail.subcategory === "laptop" ? "Laptop" : detail.subcategory === "phone" ? "Điện thoại" : detail.subcategory === "headphone" ? "Tai nghe" : detail.subcategory],
    ["Bảo hành", detail.warranty_months ? `${detail.warranty_months} tháng` : null],
    // Laptop specs
    ...(specs.cpu ? [["CPU", specs.cpu]] : []),
    ...(specs.ram ? [["RAM", specs.ram]] : []),
    ...(specs.storage ? [["Bộ nhớ", specs.storage]] : []),
    ...(specs.display ? [["Màn hình", specs.display]] : []),
    ...(specs.gpu ? [["GPU", specs.gpu]] : []),
    ...(specs.battery ? [["Pin", specs.battery]] : []),
    ...(specs.weight_kg ? [["Khối lượng", `${specs.weight_kg} kg`]] : []),
    ...(specs.os ? [["Hệ điều hành", specs.os]] : []),
    // Phone specs
    ...(specs.screen ? [["Màn hình", specs.screen]] : []),
    ...(specs.camera_main ? [["Camera sau", specs.camera_main]] : []),
    ...(specs.camera_front ? [["Camera trước", specs.camera_front]] : []),
    ...(specs.sim ? [["SIM", specs.sim]] : []),
    // Headphone specs
    ...(specs.connectivity ? [["Kết nối", specs.connectivity]] : []),
    ...(specs.battery_life_h ? [["Pin tai nghe", `${specs.battery_life_h}h`]] : []),
    ...(specs.anc !== undefined ? [["Chống ồn ANC", specs.anc ? "Có" : "Không"]] : []),
    ...(specs.type ? [["Kiểu dáng", specs.type]] : []),
  ].filter(([, v]) => v);
  return <MetaTable rows={rows} />;
}

function FashionMeta({ detail }) {
  if (!detail) return null;
  const genderMap = { male: "Nam", female: "Nữ", unisex: "Unisex" };
  const rows = [
    ["Thương hiệu", detail.brand],
    ["Chất liệu", detail.material],
    ["Giới tính", genderMap[detail.gender]],
    ["Mùa", detail.season],
    ["Size", Array.isArray(detail.sizes) ? detail.sizes.join(", ") : detail.sizes],
    ["Màu sắc", Array.isArray(detail.colors) ? detail.colors.join(", ") : detail.colors],
  ].filter(([, v]) => v);
  return <MetaTable rows={rows} />;
}

function MetaTable({ rows }) {
  return (
    <div className="border-t pt-6 space-y-2 text-sm">
      {rows.map(([label, value]) => (
        <p key={label}>
          <span className="font-medium text-gray-700">{label}:</span>{" "}
          <span className="text-gray-500">{value}</span>
        </p>
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { isAuthenticated, customer } = useAuth();

  const [product, setProduct] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [newComment, setNewComment] = useState({ rating: 5, content: "" });

  useEffect(() => {
    setLoading(true);
    productService.getById(id).then((res) => {
      setProduct(res.data);
    }).catch(() => {}).finally(() => setLoading(false));

    commentService.getByBook(id).then((res) => {
      setComments(res.data.reviews || res.data.results || res.data || []);
    }).catch(() => {});

    trackBehavior(customer?.id, id, "click");
  }, [id]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  const handleAddToCart = async () => {
    const success = await addItem(product.id, quantity);
    if (success) {
      setQuantity(1);
      trackBehavior(customer?.id, product.id, "add_to_cart");
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.warning("Vui lòng đăng nhập để bình luận"); return; }
    try {
      await commentService.create({
        book_id: parseInt(id),
        customer_id: customer.id,
        rating: newComment.rating,
        content: newComment.content,
      });
      const res = await commentService.getByBook(id);
      setComments(res.data.reviews || res.data.results || res.data || []);
      setNewComment({ rating: 5, content: "" });
      toast.success("Đã thêm đánh giá");
    } catch {
      toast.error("Không thể thêm đánh giá");
    }
  };

  if (loading) return <Loading />;
  if (!product)
    return <div className="container mx-auto px-4 py-8">Không tìm thấy sản phẩm</div>;

  const emoji = TYPE_EMOJI[product.product_type] || "🛍️";
  const typeLabel = TYPE_LABEL[product.product_type] || "Sản phẩm";
  const avgRating = comments.length > 0
    ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1 flex-wrap">
        <Link to="/" className="hover:text-primary-600">Trang chủ</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary-600">Sản phẩm</Link>
        <span>/</span>
        <Link to={`/products?type=${product.product_type}`} className="hover:text-primary-600">
          {emoji} {typeLabel}
        </Link>
        <span>/</span>
        <span className="text-gray-800 line-clamp-1">{product.name}</span>
      </nav>

      {/* Main info */}
      <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                <span className="text-9xl">{emoji}</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <span className="inline-block text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full mb-3">
              {emoji} {typeLabel}
            </span>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar key={star} className={`w-5 h-5 ${star <= avgRating ? "fill-current" : ""}`} />
                ))}
              </div>
              <span className="text-gray-500">({comments.length} đánh giá)</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-4xl font-bold text-primary-600">{formatPrice(product.price)}</span>
            </div>

            {/* Stock */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  Còn {product.stock} sản phẩm
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                  Hết hàng
                </span>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-gray-600">Số lượng:</span>
              <div className="flex items-center border rounded-lg">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-3 hover:bg-gray-100">
                  <FiMinus />
                </button>
                <span className="px-4 font-medium">{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="p-3 hover:bg-gray-100">
                  <FiPlus />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="btn-primary flex items-center gap-2 flex-grow md:flex-grow-0"
              >
                <FiShoppingCart className="w-5 h-5" />
                {product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ"}
              </button>
              <button className="btn-secondary p-3"><FiHeart className="w-5 h-5" /></button>
              <button className="btn-secondary p-3"><FiShare2 className="w-5 h-5" /></button>
            </div>

            {/* Type-specific meta */}
            {product.product_type === "book" && <BookMeta detail={product.detail} />}
            {product.product_type === "electronics" && <ElectronicsMeta detail={product.detail} />}
            {product.product_type === "fashion" && <FashionMeta detail={product.detail} />}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8">
        <div className="flex border-b">
          {["description", "reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === tab
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab === "description" ? "Mô tả" : `Đánh giá (${comments.length})`}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-b-xl p-6 shadow-sm">
          {activeTab === "description" ? (
            <p className="text-gray-600 whitespace-pre-line">
              {product.description || "Chưa có mô tả cho sản phẩm này."}
            </p>
          ) : (
            <div className="space-y-6">
              {isAuthenticated && (
                <form onSubmit={handleSubmitComment} className="border-b pb-6">
                  <h3 className="font-medium text-gray-800 mb-4">Viết đánh giá</h3>
                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-2">Đánh giá</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setNewComment((c) => ({ ...c, rating: star }))}>
                          <FiStar className={`w-8 h-8 ${star <= newComment.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={newComment.content}
                    onChange={(e) => setNewComment((c) => ({ ...c, content: e.target.value }))}
                    rows={4}
                    className="input-field mb-4"
                    placeholder="Chia sẻ cảm nhận của bạn..."
                    required
                  />
                  <button type="submit" className="btn-primary">Gửi đánh giá</button>
                </form>
              )}

              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Chưa có đánh giá nào</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border-b pb-6 last:border-b-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium">{comment.customer_name?.[0] || "U"}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{comment.customer_name || "Khách hàng"}</p>
                        <div className="flex text-yellow-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FiStar key={star} className={`w-4 h-4 ${star <= comment.rating ? "fill-current" : ""}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
