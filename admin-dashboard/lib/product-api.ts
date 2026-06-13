import { apiClient } from "./api";
import { getStaffAuthHeaders } from "./staff-auth";

export interface ProductRecord {
  id: number;
  catalog_id: number;
  product_type: "book" | "electronics" | "fashion";
  name: string;
  description: string;
  price: string;
  stock: number;
  image_url: string;
  is_active: boolean;
  detail: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CatalogRecord {
  id: number;
  name: string;
  description: string;
  icon: string;
  product_type: string;
}

export interface ProductPayload {
  catalog_id: number;
  product_type: "book" | "electronics" | "fashion";
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
  is_active?: boolean;
}

export async function fetchProducts(productType?: string) {
  const params = productType ? { product_type: productType } : {};
  const response = await apiClient.get("/api/products/products/", { params });
  const data = response.data;
  return (Array.isArray(data) ? data : data.results ?? []) as ProductRecord[];
}

export async function fetchProductCatalogs() {
  const response = await apiClient.get("/api/catalogs/catalogs/");
  const data = response.data;
  return (Array.isArray(data) ? data : data.results ?? []) as CatalogRecord[];
}

export async function createProduct(payload: ProductPayload) {
  const response = await apiClient.post("/api/products/products/", payload, {
    headers: getStaffAuthHeaders(),
  });
  return response.data as ProductRecord;
}

export async function updateProduct(id: number, payload: Partial<ProductPayload>) {
  const response = await apiClient.patch(`/api/products/products/${id}/`, payload, {
    headers: getStaffAuthHeaders(),
  });
  return response.data as ProductRecord;
}

export async function deleteProduct(id: number) {
  await apiClient.delete(`/api/products/products/${id}/`, {
    headers: getStaffAuthHeaders(),
  });
}
