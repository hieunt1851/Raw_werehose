export interface RawMaterial {
  id: number;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  diff: number;
  slug: string;
  between: string;
  real: number;
}

export interface OrderItem {
  code: string;
  name: string;
  unit: string;
  quantity: number;
}

export interface PurchaseOrder {
  code: string;
  items: OrderItem[];
}

export interface Supplier {
  id: number;
  code: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

// API Types for Purchase Orders
export interface ApiOrderItem {
  product_id: number;
  product_code: string;
  product_name: string;
  product_diff_allowed: string;
  unit_code: string;
  unit_name: string;
  quantity: string;
  product_photo: string;
}

export interface ApiOrder {
  po_supplier_id: number;
  po_supplier_code: string;
  po_supplier_name: string;
  po_id: number;
  po_items: ApiOrderItem[];
}

export interface ApiPurchaseOrderResponse {
  date: string;
  warehouse_code: string;
  warehouse_name: string;
  total_orders: number;
  orders: ApiOrder[];
}

export interface SavedItem {
  material: RawMaterial;
  quantity: number;
  colorDiff: number;
  timestamp: Date;
  standardImage: string;
  capturedImage: string;
  item_id?: number;
}

export type ToastType = 'success' | 'danger' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface PhotoAnalysis {
  predictedMaterial: RawMaterial;
  quantity: number;
  colorDiff: number;
  standardImage: string;
  capturedImage: string;
  analysisFailed?: boolean;
  item_id?: number;
} 