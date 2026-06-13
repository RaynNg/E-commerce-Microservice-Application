"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  fetchOrders, cancelOrder, patchOrderStatus,
  ORDER_STATUSES, ORDER_STATUS_VI,
  type OrderRecord, type OrderStatus,
} from "@/lib/ops-api";
import { getStaffSession, isStaffAuthenticated } from "@/lib/staff-auth";
import { AlertCircle, ChevronDown, ChevronRight, Loader2, RefreshCw, Search, XCircle } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  pending:               "bg-yellow-100 text-yellow-700",
  confirmed:             "bg-blue-100 text-blue-700",
  paid:                  "bg-emerald-100 text-emerald-700",
  shipped:               "bg-indigo-100 text-indigo-700",
  delivered:             "bg-green-100 text-green-700",
  cancelled:             "bg-gray-100 text-gray-500",
  failed:                "bg-red-100 text-red-700",
  payment_pending_retry: "bg-orange-100 text-orange-700",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
}
function fmtVND(v: string | number) {
  return Number(v).toLocaleString("vi-VN") + " ₫";
}

const METHOD_VI: Record<string, string> = {
  credit_card: "Thẻ TD", debit_card: "Thẻ GN",
  paypal: "PayPal", bank_transfer: "CK", cod: "COD",
  standard: "Tiêu chuẩn", express: "Nhanh", overnight: "Hoả tốc",
};

export function OrderManager() {
  const [orders, setOrders]       = useState<OrderRecord[]>([]);
  const [loading, setLoading]     = useState(true);
  const [busy, setBusy]           = useState<number | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [expanded, setExpanded]   = useState<Set<number>>(new Set());

  const staffAuthenticated = isStaffAuthenticated();
  const staffSession = getStaffSession();

  const load = async () => {
    setLoading(true); setError(null);
    try { setOrders(await fetchOrders()); }
    catch (e) { setError(e instanceof Error ? e.message : "Không thể tải đơn hàng"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = orders;
    if (statusFilter !== "all") list = list.filter(o => o.status === statusFilter);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(o =>
      String(o.id).includes(q) ||
      String(o.customer_id).includes(q) ||
      o.shipping_address.toLowerCase().includes(q)
    );
    return list;
  }, [orders, statusFilter, search]);

  const toggleExpand = (id: number) =>
    setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const handleCancel = async (o: OrderRecord) => {
    if (!window.confirm(`Hủy đơn hàng #${o.id}?`)) return;
    setBusy(o.id); setError(null);
    try { await cancelOrder(o.id); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Không thể hủy đơn"); }
    finally { setBusy(null); }
  };

  const handleStatusChange = async (o: OrderRecord, status: OrderStatus) => {
    if (!window.confirm(`Đổi trạng thái đơn #${o.id} → "${ORDER_STATUS_VI[status]}"?`)) return;
    setBusy(o.id); setError(null);
    try { await patchOrderStatus(o.id, status); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Không thể cập nhật"); }
    finally { setBusy(null); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-orange-500/5 via-background to-background">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>📦 Quản lý đơn hàng</CardTitle>
              <CardDescription>Xem, hủy và cập nhật trạng thái đơn hàng.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {staffAuthenticated ? (
                <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs text-green-700">
                  Staff: {staffSession?.username}
                </span>
              ) : (
                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-700">
                  Chưa đăng nhập — chỉ đọc
                </span>
              )}
              <Button variant="outline" size="sm" onClick={load} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Tải lại
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-2 py-3">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Tìm # đơn, # KH, địa chỉ..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as OrderStatus | "all")}
        >
          <option value="all">Tất cả trạng thái</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{ORDER_STATUS_VI[s]}</option>)}
        </select>
        <span className="flex items-center text-sm text-muted-foreground">
          {filtered.length} / {orders.length} đơn
        </span>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang tải...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3 text-left w-8"></th>
                    <th className="px-3 py-3 text-left">#Đơn</th>
                    <th className="px-3 py-3 text-left">#KH</th>
                    <th className="px-3 py-3 text-left">Trạng thái</th>
                    <th className="px-3 py-3 text-left">Tổng tiền</th>
                    <th className="px-3 py-3 text-left">TT / Giao hàng</th>
                    <th className="px-3 py-3 text-left">Ngày tạo</th>
                    <th className="px-3 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="py-12 text-center text-muted-foreground">Không có đơn hàng.</td></tr>
                  ) : filtered.map(o => (
                    <>
                      <tr key={o.id} className="border-t hover:bg-muted/20">
                        <td className="px-3 py-3">
                          <button onClick={() => toggleExpand(o.id)} className="text-muted-foreground hover:text-foreground">
                            {expanded.has(o.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        </td>
                        <td className="px-3 py-3 font-mono font-semibold">#{o.id}</td>
                        <td className="px-3 py-3 text-muted-foreground">#{o.customer_id}</td>
                        <td className="px-3 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[o.status] ?? "bg-gray-100 text-gray-600"}`}>
                            {ORDER_STATUS_VI[o.status] ?? o.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-semibold">{fmtVND(o.total_amount)}</td>
                        <td className="px-3 py-3 text-xs text-muted-foreground">
                          {METHOD_VI[o.payment_method] || o.payment_method} / {METHOD_VI[o.shipping_method] || o.shipping_method}
                        </td>
                        <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmt(o.created_at)}</td>
                        <td className="px-3 py-3">
                          <div className="flex justify-end items-center gap-2">
                            {staffAuthenticated && !["cancelled", "delivered", "failed"].includes(o.status) && (
                              <Button
                                size="sm" variant="destructive"
                                disabled={busy === o.id}
                                onClick={() => handleCancel(o)}
                              >
                                {busy === o.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                                <span className="ml-1">Hủy</span>
                              </Button>
                            )}
                            {staffAuthenticated && (
                              <select
                                className="h-8 rounded border border-input bg-background px-2 text-xs"
                                value={o.status}
                                disabled={busy === o.id}
                                onChange={e => handleStatusChange(o, e.target.value as OrderStatus)}
                              >
                                {ORDER_STATUSES.map(s => <option key={s} value={s}>{ORDER_STATUS_VI[s]}</option>)}
                              </select>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expanded.has(o.id) && (
                        <tr key={`${o.id}-items`} className="bg-muted/30 border-t">
                          <td colSpan={8} className="px-6 py-3">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">
                              Sản phẩm trong đơn · Địa chỉ: {o.shipping_address || "—"}
                            </p>
                            {(!o.items || o.items.length === 0) ? (
                              <p className="text-xs text-muted-foreground">Không có thông tin sản phẩm.</p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {o.items.map(item => (
                                  <span key={item.id} className="rounded bg-background border px-2 py-1 text-xs">
                                    SP #{item.book_id} × {item.quantity} — {fmtVND(item.price)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
