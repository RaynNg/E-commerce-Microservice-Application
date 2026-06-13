"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  fetchShipments, updateShipmentStatus,
  SHIPMENT_STATUSES, SHIPMENT_STATUS_VI, SHIPMENT_METHOD_VI,
  type ShipmentRecord, type ShipmentStatus,
} from "@/lib/ops-api";
import { getStaffSession, isStaffAuthenticated } from "@/lib/staff-auth";
import { AlertCircle, Loader2, RefreshCw, Search, Truck } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped:    "bg-indigo-100 text-indigo-700",
  in_transit: "bg-violet-100 text-violet-700",
  delivered:  "bg-emerald-100 text-emerald-700",
  failed:     "bg-red-100 text-red-700",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
}

export function ShippingManager() {
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [loading, setLoading]     = useState(true);
  const [busy, setBusy]           = useState<number | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "all">("all");

  const staffAuthenticated = isStaffAuthenticated();
  const staffSession = getStaffSession();

  const load = async () => {
    setLoading(true); setError(null);
    try { setShipments(await fetchShipments()); }
    catch (e) { setError(e instanceof Error ? e.message : "Không thể tải vận chuyển"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = shipments;
    if (statusFilter !== "all") list = list.filter(s => s.status === statusFilter);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(s =>
      String(s.id).includes(q) ||
      String(s.order_id).includes(q) ||
      String(s.customer_id).includes(q) ||
      s.tracking_number.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q)
    );
    return list;
  }, [shipments, statusFilter, search]);

  const handleStatusChange = async (s: ShipmentRecord, status: ShipmentStatus) => {
    if (s.status === status) return;
    if (!window.confirm(`Cập nhật vận đơn #${s.id} → "${SHIPMENT_STATUS_VI[status]}"?`)) return;
    setBusy(s.id); setError(null);
    try { await updateShipmentStatus(s.id, status); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Không thể cập nhật trạng thái"); }
    finally { setBusy(null); }
  };

  // Progress summary
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    shipments.forEach(s => { c[s.status] = (c[s.status] || 0) + 1; });
    return c;
  }, [shipments]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-teal-500/5 via-background to-background">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>🚚 Quản lý vận chuyển</CardTitle>
              <CardDescription>Theo dõi và cập nhật trạng thái các vận đơn.</CardDescription>
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

      {/* Progress summary */}
      {!loading && shipments.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {SHIPMENT_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
              className={`rounded-lg border p-2 text-center transition-all hover:scale-105 ${
                STATUS_COLOR[s]
              } ${statusFilter === s ? "ring-2 ring-offset-1 ring-current" : ""}`}
            >
              <p className="text-xs font-medium opacity-80">{SHIPMENT_STATUS_VI[s]}</p>
              <p className="text-xl font-bold">{counts[s] || 0}</p>
            </button>
          ))}
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
          <Input className="pl-9" placeholder="Tìm #VĐ, #đơn, mã tracking..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as ShipmentStatus | "all")}
        >
          <option value="all">Tất cả trạng thái</option>
          {SHIPMENT_STATUSES.map(s => <option key={s} value={s}>{SHIPMENT_STATUS_VI[s]}</option>)}
        </select>
        <span className="flex items-center text-sm text-muted-foreground">
          {filtered.length} / {shipments.length} vận đơn
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
                    <th className="px-4 py-3 text-left">#VĐ</th>
                    <th className="px-4 py-3 text-left">#Đơn</th>
                    <th className="px-4 py-3 text-left">#KH</th>
                    <th className="px-4 py-3 text-left">Trạng thái</th>
                    <th className="px-4 py-3 text-left">Phương thức</th>
                    <th className="px-4 py-3 text-left">Mã tracking</th>
                    <th className="px-4 py-3 text-left">Địa chỉ</th>
                    <th className="px-4 py-3 text-left">Ngày</th>
                    {staffAuthenticated && <th className="px-4 py-3 text-right">Cập nhật</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={staffAuthenticated ? 9 : 8} className="py-12 text-center text-muted-foreground">
                      Không có vận đơn.
                    </td></tr>
                  ) : filtered.map(s => (
                    <tr key={s.id} className="border-t hover:bg-muted/20">
                      <td className="px-4 py-3 font-mono font-semibold">#{s.id}</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">#{s.order_id}</td>
                      <td className="px-4 py-3 text-muted-foreground">#{s.customer_id}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[s.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {SHIPMENT_STATUS_VI[s.status] ?? s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">{SHIPMENT_METHOD_VI[s.method] || s.method}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.tracking_number}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[180px] truncate" title={s.address}>
                        {s.address}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmt(s.created_at)}</td>
                      {staffAuthenticated && (
                        <td className="px-4 py-3">
                          <div className="flex justify-end items-center gap-2">
                            {busy === s.id && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                            <select
                              className="h-8 rounded border border-input bg-background px-2 text-xs"
                              value={s.status}
                              disabled={busy === s.id}
                              onChange={e => handleStatusChange(s, e.target.value as ShipmentStatus)}
                            >
                              {SHIPMENT_STATUSES.map(st => (
                                <option key={st} value={st}>{SHIPMENT_STATUS_VI[st]}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                      )}
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
