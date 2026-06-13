import { apiClient } from "./api";
import { getStaffAuthHeaders } from "./staff-auth";

// ─── Orders ─────────────────────────────────────────────────────────────────

export const ORDER_STATUSES = [
  "pending", "confirmed", "failed", "paid",
  "shipped", "delivered", "cancelled", "payment_pending_retry",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_VI: Record<OrderStatus, string> = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  failed: "Thất bại",
  paid: "Đã thanh toán",
  shipped: "Đang vận chuyển",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
  payment_pending_retry: "Chờ TT lại",
};

export interface OrderItem {
  id: number;
  book_id: number;
  quantity: number;
  price: string;
}

export interface OrderRecord {
  id: number;
  customer_id: number;
  total_amount: string;
  status: OrderStatus;
  payment_method: string;
  shipping_method: string;
  shipping_address: string;
  payment_id: number | null;
  shipping_id: number | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export async function fetchOrders() {
  const res = await apiClient.get("/api/orders/orders/");
  const d = res.data;
  return (Array.isArray(d) ? d : d.results ?? []) as OrderRecord[];
}

export async function cancelOrder(id: number) {
  const res = await apiClient.post(`/api/orders/orders/${id}/cancel/`, {}, {
    headers: getStaffAuthHeaders(),
  });
  return res.data as OrderRecord;
}

export async function patchOrderStatus(id: number, status: OrderStatus) {
  const res = await apiClient.patch(`/api/orders/orders/${id}/`, { status }, {
    headers: getStaffAuthHeaders(),
  });
  return res.data as OrderRecord;
}

// ─── Payments ────────────────────────────────────────────────────────────────

export const PAYMENT_STATUSES = [
  "pending", "processing", "completed", "failed", "refunded",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_VI: Record<PaymentStatus, string> = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  completed: "Thành công",
  failed: "Thất bại",
  refunded: "Đã hoàn tiền",
};

export const PAYMENT_METHOD_VI: Record<string, string> = {
  credit_card: "Thẻ tín dụng",
  debit_card: "Thẻ ghi nợ",
  paypal: "PayPal",
  bank_transfer: "Chuyển khoản",
  cod: "COD",
};

export interface PaymentRecord {
  id: number;
  order_id: number;
  customer_id: number;
  amount: string;
  method: string;
  status: PaymentStatus;
  transaction_id: string;
  created_at: string;
  updated_at: string;
}

export async function fetchPayments() {
  const res = await apiClient.get("/api/payments/payments/");
  const d = res.data;
  return (Array.isArray(d) ? d : d.results ?? []) as PaymentRecord[];
}

export async function processPayment(id: number) {
  const res = await apiClient.post(`/api/payments/payments/${id}/process/`, {}, {
    headers: getStaffAuthHeaders(),
  });
  return res.data as PaymentRecord;
}

export async function refundPayment(id: number) {
  const res = await apiClient.post(`/api/payments/payments/${id}/refund/`, {}, {
    headers: getStaffAuthHeaders(),
  });
  return res.data as PaymentRecord;
}

// ─── Shipments ───────────────────────────────────────────────────────────────

export const SHIPMENT_STATUSES = [
  "pending", "processing", "shipped", "in_transit", "delivered", "failed",
] as const;
export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export const SHIPMENT_STATUS_VI: Record<ShipmentStatus, string> = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  shipped: "Đã gửi hàng",
  in_transit: "Đang vận chuyển",
  delivered: "Đã giao",
  failed: "Thất bại",
};

export const SHIPMENT_METHOD_VI: Record<string, string> = {
  standard: "Tiêu chuẩn",
  express: "Nhanh",
  overnight: "Hoả tốc",
};

export interface ShipmentRecord {
  id: number;
  order_id: number;
  customer_id: number;
  address: string;
  method: string;
  status: ShipmentStatus;
  tracking_number: string;
  created_at: string;
  updated_at: string;
}

export async function fetchShipments() {
  const res = await apiClient.get("/api/shipments/shipments/");
  const d = res.data;
  return (Array.isArray(d) ? d : d.results ?? []) as ShipmentRecord[];
}

export async function updateShipmentStatus(id: number, status: ShipmentStatus) {
  const res = await apiClient.post(`/api/shipments/shipments/${id}/update_status/`, { status }, {
    headers: getStaffAuthHeaders(),
  });
  return res.data as ShipmentRecord;
}
