import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { chatbotService } from "../services";

const TYPE_EMOJI = { book: "📚", laptop: "💻", fashion: "👕" };

const SUGGESTED = [
  "Laptop gaming dưới 20 triệu",
  "Sách về khoa học vũ trụ",
  "Đồ đi biển cho nữ",
  "MacBook cho lập trình viên",
];

function formatPrice(price) {
  return Number(price).toLocaleString("vi-VN") + "đ";
}

function ProductCard({ product }) {
  const emoji = TYPE_EMOJI[product.product_type] || "🛍️";
  return (
    <a
      href={`/products/${product.product_id}`}
      className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 rounded-lg p-2 text-xs text-blue-800 transition-colors mt-1"
    >
      <span className="text-base flex-shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{product.name}</div>
        <div className="text-blue-600 font-semibold">{formatPrice(product.price)}</div>
      </div>
      <span className="text-blue-400 flex-shrink-0">→</span>
    </a>
  );
}

export default function ChatWidget() {
  const { customer } = useAuth();
  const [open, setOpen]         = useState(false);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Xin chào! Tôi là trợ lý ShopMicro 🛍️\nBạn cần tư vấn sách 📚, laptop 💻 hay quần áo 👕?",
      products: [],
      time: new Date(),
    },
  ]);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const customerId = customer?.id ?? null;

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");

    setMessages((prev) => [
      ...prev,
      { role: "user", content: msg, products: [], time: new Date() },
    ]);
    setLoading(true);

    try {
      const res = await chatbotService.send(msg, customerId);
      const data = res.data;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "Xin lỗi, không có phản hồi.",
          products: data.products || [],
          time: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!",
          products: [],
          time: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (d) =>
    d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl
                   bg-gradient-to-br from-blue-600 to-blue-800
                   flex items-center justify-center text-white text-2xl
                   hover:scale-110 transition-transform"
        aria-label="Mở chat tư vấn"
      >
        {open ? "✕" : "💬"}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[580px]
                        flex flex-col rounded-2xl shadow-2xl overflow-hidden
                        border border-gray-200 bg-white">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">
              🤖
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Trợ lý ShopMicro</p>
              <p className="text-blue-200 text-xs">Tư vấn sách • Laptop • Thời trang</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50 min-h-0"
            style={{ maxHeight: "360px" }}
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">
                    🤖
                  </div>
                )}
                <div className={`max-w-[80%] flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                      ${m.role === "user"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm"
                      }`}
                  >
                    {m.content}
                  </div>
                  {/* Product cards */}
                  {m.products && m.products.length > 0 && (
                    <div className="w-full mt-1 space-y-1">
                      {m.products.slice(0, 3).map((p) => (
                        <ProductCard key={p.product_id} product={p} />
                      ))}
                    </div>
                  )}
                  <span className="text-[10px] text-gray-400 mt-1 px-1">{fmt(m.time)}</span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-sm mr-2 flex-shrink-0">
                  🤖
                </div>
                <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                        style={{ animationDelay: `${d * 0.15}s` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length <= 1 && (
            <div className="px-3 pb-2 bg-gray-50 flex flex-wrap gap-1 border-t border-gray-100">
              {SUGGESTED.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-xs px-2 py-1 rounded-full border border-blue-200
                             text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-2 border-t border-gray-100 bg-white flex gap-2 items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Bạn cần tư vấn gì?"
              disabled={loading}
              className="flex-1 text-sm px-3 py-2 rounded-full border border-gray-200
                         focus:outline-none focus:border-blue-400 bg-gray-50"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center
                         disabled:opacity-40 hover:bg-blue-700 transition-colors flex-shrink-0"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
