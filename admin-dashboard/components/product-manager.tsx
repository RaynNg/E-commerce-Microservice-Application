"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  fetchProducts,
  fetchProductCatalogs,
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductRecord,
  type CatalogRecord,
  type ProductPayload,
} from "@/lib/product-api";
import {
  getStaffSession,
  isStaffAuthenticated,
  logoutStaff,
} from "@/lib/staff-auth";
import {
  AlertCircle,
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";

type ProductType = "book" | "electronics" | "fashion";

const TABS: { key: ProductType; label: string; icon: string }[] = [
  { key: "book", label: "Sách", icon: "📚" },
  { key: "electronics", label: "Điện tử", icon: "🖥️" },
  { key: "fashion", label: "Thời trang", icon: "👗" },
];

type FormState = {
  name: string;
  description: string;
  price: string;
  stock: string;
  catalog_id: string;
  image_url: string;
  is_active: boolean;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  price: "",
  stock: "0",
  catalog_id: "",
  image_url: "",
  is_active: true,
};

function toNum(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function renderDetail(p: ProductRecord): string {
  const d = p.detail || {};
  if (p.product_type === "book") {
    return (d as any).author || "";
  }
  if (p.product_type === "electronics") {
    const brand = (d as any).brand || "";
    const sub = (d as any).subcategory || "";
    return [brand, sub].filter(Boolean).join(" · ");
  }
  if (p.product_type === "fashion") {
    const brand = (d as any).brand || "";
    const genderRaw = (d as any).gender;
    const gender =
      genderRaw === "male" ? "Nam" : genderRaw === "female" ? "Nữ" : "Unisex";
    return [brand, gender].filter(Boolean).join(" · ");
  }
  return "";
}

function detailColumnLabel(type: ProductType): string {
  if (type === "book") return "Tác giả";
  if (type === "electronics") return "Thương hiệu · Loại";
  return "Thương hiệu · Giới tính";
}

export function ProductManager() {
  const [activeTab, setActiveTab] = useState<ProductType>("book");
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [catalogs, setCatalogs] = useState<CatalogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const staffSession = getStaffSession();
  const staffAuthenticated = isStaffAuthenticated();

  const tabCatalogs = useMemo(
    () => catalogs.filter((c) => c.product_type === activeTab),
    [catalogs, activeTab]
  );

  const catalogMap = useMemo(
    () => new Map(catalogs.map((c) => [c.id, c])),
    [catalogs]
  );

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) =>
      [p.name, p.description, String(p.price)]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [products, searchTerm]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prods, cats] = await Promise.all([
        fetchProducts(activeTab),
        fetchProductCatalogs(),
      ]);
      setProducts(prods);
      setCatalogs(cats);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải dữ liệu sản phẩm"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const switchTab = (tab: ProductType) => {
    setActiveTab(tab);
    resetForm();
    setSearchTerm("");
  };

  const beginEdit = (p: ProductRecord) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || "",
      price: String(p.price),
      stock: String(p.stock),
      catalog_id: String(p.catalog_id),
      image_url: p.image_url || "",
      is_active: p.is_active,
    });
  };

  const submitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: ProductPayload = {
        product_type: activeTab,
        catalog_id: toNum(form.catalog_id),
        name: form.name.trim(),
        description: form.description.trim(),
        price: toNum(form.price),
        stock: toNum(form.stock),
        image_url: form.image_url.trim(),
        is_active: form.is_active,
      };
      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }
      await loadData();
      resetForm();
    } catch (err: any) {
      const msg = err?.response?.data
        ? JSON.stringify(err.response.data)
        : err instanceof Error
        ? err.message
        : "Không thể lưu sản phẩm";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = async (p: ProductRecord) => {
    if (!window.confirm(`Xóa sản phẩm "${p.name}"?`)) return;
    setRemovingId(p.id);
    setError(null);
    try {
      await deleteProduct(p.id);
      await loadData();
      if (editingId === p.id) resetForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể xóa sản phẩm"
      );
    } finally {
      setRemovingId(null);
    }
  };

  const activeTabMeta = TABS.find((t) => t.key === activeTab)!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-background">
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Quản lý sản phẩm</CardTitle>
              <CardDescription>
                Tạo, sửa, xóa sản phẩm từ product-service — Sách · Điện tử · Thời trang.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {staffAuthenticated ? (
                <div className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-sm text-green-700">
                  Đã đăng nhập: {staffSession?.username}
                </div>
              ) : (
                <div className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-sm text-amber-700">
                  Chưa đăng nhập staff
                </div>
              )}
              <Button variant="outline" size="sm" onClick={loadData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Tải lại
              </Button>
              {staffAuthenticated && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logoutStaff();
                    window.location.reload();
                  }}
                >
                  Đăng xuất staff
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => switchTab(tab.key)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors
              ${
                activeTab === tab.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Có lỗi xảy ra</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form + Table */}
      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* Create / Edit form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? "Sửa sản phẩm" : `Thêm ${activeTabMeta.label} mới`}
            </CardTitle>
            <CardDescription>
              {staffAuthenticated
                ? `Nhập thông tin sản phẩm loại ${activeTabMeta.label}.`
                : "Bạn cần đăng nhập staff để thực hiện thao tác này."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submitProduct}>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên sản phẩm</label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder={`Nhập tên ${activeTabMeta.label.toLowerCase()}`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Giá (₫)</label>
                  <Input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tồn kho</label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, stock: e.target.value }))
                    }
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Danh mục</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.catalog_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, catalog_id: e.target.value }))
                  }
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {tabCatalogs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ảnh URL</label>
                <Input
                  value={form.image_url}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, image_url: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mô tả</label>
                <textarea
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Nhập mô tả sản phẩm"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, is_active: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="is_active" className="text-sm font-medium">
                  Đang kinh doanh
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={saving || !staffAuthenticated}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : editingId ? (
                    <>
                      <Edit3 className="mr-2 h-4 w-4" />
                      Cập nhật
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Tạo mới
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Xóa form
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Product list table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>
                  {activeTabMeta.icon} Danh sách {activeTabMeta.label}
                </CardTitle>
                <CardDescription>
                  Tổng số: {filteredProducts.length} / {products.length} sản phẩm
                </CardDescription>
              </div>
              <div className="relative w-full lg:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Tìm theo tên, mô tả, giá..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center rounded-lg border py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang tải dữ liệu...
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Sản phẩm</th>
                      <th className="px-4 py-3">
                        {detailColumnLabel(activeTab)}
                      </th>
                      <th className="px-4 py-3">Danh mục</th>
                      <th className="px-4 py-3">Giá</th>
                      <th className="px-4 py-3">Kho</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-10 text-center text-muted-foreground"
                        >
                          Không có sản phẩm nào.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr key={p.id} className="border-t hover:bg-muted/30">
                          <td className="px-4 py-3 align-top">
                            <div className="max-w-[200px] truncate font-medium">
                              {p.name}
                            </div>
                            <div className="max-w-[200px] truncate text-xs text-muted-foreground">
                              {p.description || "Không có mô tả"}
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top text-xs text-muted-foreground">
                            {renderDetail(p)}
                          </td>
                          <td className="px-4 py-3 align-top text-xs">
                            {catalogMap.get(p.catalog_id)?.icon}{" "}
                            {catalogMap.get(p.catalog_id)?.name ?? p.catalog_id}
                          </td>
                          <td className="px-4 py-3 align-top whitespace-nowrap">
                            {Number(p.price).toLocaleString("vi-VN")} ₫
                          </td>
                          <td className="px-4 py-3 align-top">{p.stock}</td>
                          <td className="px-4 py-3 align-top">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs ${
                                p.is_active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {p.is_active ? "Đang bán" : "Ẩn"}
                            </span>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => beginEdit(p)}
                              >
                                <Edit3 className="mr-1 h-3.5 w-3.5" />
                                Sửa
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                disabled={
                                  removingId === p.id || !staffAuthenticated
                                }
                                onClick={() => removeProduct(p)}
                              >
                                {removingId === p.id ? (
                                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                                )}
                                Xóa
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
