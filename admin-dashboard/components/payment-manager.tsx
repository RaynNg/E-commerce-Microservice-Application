"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  fetchPayments, processPayment, refundPayment,
  PAYMENT_STATUSES, PAYMENT_STATUS_VI, PAYMENT_METHOD_VI,
  type PaymentRecord, type PaymentStatus,
} from "@/lib/ops-api";
import { getStaffSession, isStaffAuthenticated } from "@/lib/staff-auth";
import { AlertCircle, CheckCircle, Loader2, RefreshCw, RotateCcw, Search } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  completed:  "bg-emerald-100 text-emerald-700",
  failed:     "bg-red-100 text-red-700",
  refunded:   "bg-purple-100 text-purple-700",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
}
function fmtVND(v: string | number) {
  return Number(v).toLocaleString("vi-VN") + " ₫";
}

export function PaymentManager() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading]   = useState(true);
  const [busy, setBusy]         = useState<number | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");

  const staffAuthenticated = isStaffAuthenticated();
  const staffSession = getStaffSession();

  const load = async () => {
    setLoading(true); setError(null);
    try { setPayments(await fetchPayments()); }
    catch (e) { setError(e instanceof Error ? e.message : "Không thể tải thanh toán"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = payments;
    if (statusFilter !== "all") list = list.filter(p => p.status === statusFilter);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(p =>
      String(p.id).includes(q) ||
      String(p.order_id).includes(q) ||
      String(p.customer_id).includes(q) ||
      p.transaction_id.toLowerCase().includes(q)
    );
    return list;
  }, [payments, statusFilter, search]);

  const act = async (
    p: PaymentRecord,
    fn: (id: number) => Promise<PaymentRecord>,
    label: string,
  ) => {
    if (!window.confirm(`${label} thanh toán #${p.id}?`)) return;
    setBusy(p.id); setError(null);
    try { await fn(p.id); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : `Không thể ${label}`); }
    finally { setBusy(null); }
  };

  // Summary counts
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    payments.forEach(p => { c[p.status] = (c[p.status] || 0) + 1; });
    return c;
  }, [payments]);

  const totalCompleted = useMemo(
    () => payments.filter(p => p.status === "completed").reduce((s, p) => s + Number(p.amount), 0),
    [payments],
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-pink-500/5 via-background to-background">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>💳 Quản lý thanh toán</CardTitle>
              <CardDescription>Xử lý và hoàn tiền các giao dịch thanh toán.</CardDescription>
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

      {/* Summary */}
      {!loading && payments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["pending", "completed", "failed", "refunded"] as PaymentStatus[]).map(s => (
            <div key={s} className={`rounded-lg border p-3 ${STATUS_COLOR[s]}`}>
              <p className="text-xs font-medium opacity-80">{PAYMENT_STATUS_VI[s]}</p>
              <p className="text-2xl font-bold">{counts[s] || 0}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && totalCompleted > 0 && (
        <div className="rounded-lg border bg-emerald-50 p-4 text-emerald-700">
          <span className="text-sm font-medium">Tổng đã thu: </span>
          <span className="text-xl font-bold">{fmtVND(totalCompleted)}</span>
        </div>
      )}

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
          <Input className="pl-9" placeholder="Tìm #TT, #đơn, mã GD..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as PaymentStatus | "all")}
        >
          <option value="all">Tất cả trạng thái</option>
          {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{PAYMENT_STATUS_VI[s]}</option>)}
        </select>
        <span className="flex items-center text-sm text-muted-foreground">
          {filtered.length} / {payments.length} giao dịch
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
                    <th className="px-4 py-3 text-left">#TT</th>
                    <th className="px-4 py-3 text-left">#Đơn</th>
                    <th className="px-4 py-3 text-left">#KH</th>
                    <th className="px-4 py-3 text-left">Số tiền</th>
                    <th className="px-4 py-3 text-left">Phương thức</th>
                    <th className="px-4 py-3 text-left">Trạng thái</th>
                    <th className="px-4 py-3 text-left">Mã GD</th>
                    <th className="px-4 py-3 text-left">Ngày</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={9} className="py-12 text-center text-muted-foreground">Không có giao dịch.</td></tr>
                  ) : filtered.map(p => (
                    <tr key={p.id} className="border-t hover:bg-muted/20">
                      <td className="px-4 py-3 font-mono font-semibold">#{p.id}</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">#{p.order_id}</td>
                      <td className="px-4 py-3 text-muted-foreground">#{p.customer_id}</td>
                      <td className="px-4 py-3 font-semibold whitespace-nowrap">{fmtVND(p.amount)}</td>
                      <td className="px-4 py-3 text-xs">{PAYMENT_METHOD_VI[p.method] || p.method}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {PAYMENT_STATUS_VI[p.status] ?? p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.transaction_id}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmt(p.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {staffAuthenticated && p.status === "pending" && (
                            <Button size="sm" variant="default" disabled={busy === p.id}
                              onClick={() => act(p, processPayment, "Xử lý")}>
                              {busy === p.id
                                ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                                : <CheckCircle className="mr-1 h-3.5 w-3.5" />}
                              Xử lý
                            </Button>
                          )}
                          {staffAuthenticated && p.status === "completed" && (
                            <Button size="sm" variant="outline" disabled={busy === p.id}
                              onClick={() => act(p, refundPayment, "Hoàn tiền")}>
                              {busy === p.id
                                ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                                : <RotateCcw className="mr-1 h-3.5 w-3.5" />}
                              Hoàn tiền
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
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
