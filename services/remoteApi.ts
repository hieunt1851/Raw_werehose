import { Supplier, ApiPurchaseOrderResponse, ApiOrder, ApiOrderItem } from '@/types';

const API_BASE_URL = '/api';

interface ApiSupplier {
  id: number;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const supplierApi = {
  async getSuppliers(): Promise<Supplier[]> {
    try {
      const data: ApiSupplier[] = await apiFetch<ApiSupplier[]>(`${API_BASE_URL}/raw/supplier/get/`);
      return data.map(supplier => ({
        id: supplier.id,
        code: supplier.code,
        name: supplier.name,
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || ''
      }));
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return [
        {
          id: 1,
          code: 'NCC_MEAT',
          name: 'CTY Meat',
          phone: '090 123 4567',
          email: 'meat@example.com',
          address: '123 Meat Street'
        },
        {
          id: 2,
          code: 'NCC_SEAFOOD',
          name: 'CTY Seafood',
          phone: '090 456 7890',
          email: 'seafood@example.com',
          address: '456 Seafood Avenue'
        }
      ];
    }
  },
  async getSuppliersByIds(supplierIds: number[]): Promise<Supplier[]> {
    try {
      const allSuppliers = await this.getSuppliers();
      return allSuppliers.filter(supplier => supplierIds.includes(supplier.id));
    } catch (error) {
      console.error('Error fetching suppliers by IDs:', error);
      return [];
    }
  },
  async getSupplierById(id: number): Promise<Supplier | null> {
    try {
      const data: ApiSupplier = await apiFetch<ApiSupplier>(`${API_BASE_URL}/raw/supplier/get/${id}/`);
      return {
        id: data.id,
        code: data.code,
        name: data.name,
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || ''
      };
    } catch (error) {
      console.error(`Error fetching supplier ${id}:`, error);
      return null;
    }
  },
  async createSupplier(supplier: Omit<Supplier, 'id'>): Promise<Supplier> {
    const data: ApiSupplier = await apiFetch<ApiSupplier>(`${API_BASE_URL}/raw/supplier/create/`, {
      method: 'POST',
      body: JSON.stringify(supplier),
    });
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || ''
    };
  },
  async updateSupplier(id: number, supplier: Partial<Supplier>): Promise<Supplier> {
    const data: ApiSupplier = await apiFetch<ApiSupplier>(`${API_BASE_URL}/raw/supplier/update/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(supplier),
    });
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || ''
    };
  },
  async deleteSupplier(id: number): Promise<boolean> {
    try {
      await apiFetch(`${API_BASE_URL}/raw/supplier/delete/${id}/`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error(`Error deleting supplier ${id}:`, error);
      return false;
    }
  }
};

export const purchaseOrderApi = {
  async getPurchaseOrders(date: string): Promise<ApiPurchaseOrderResponse> {
    try {
      const data: ApiPurchaseOrderResponse = await apiFetch<ApiPurchaseOrderResponse>(
        `${API_BASE_URL}/raw/po/get/?date=${date}`
      );
      return data;
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      throw error;
    }
  },
  getUniqueSupplierIds(orders: ApiOrder[]): number[] {
    return orders.map(order => order.po_supplier_id);
  },
  getOrdersBySupplier(orders: ApiOrder[], supplierId: number): ApiOrder[] {
    return orders.filter(order => order.po_supplier_id === supplierId);
  },
  getOrderItems(orders: ApiOrder[]): ApiOrderItem[] {
    const allItems: ApiOrderItem[] = [];
    orders.forEach(order => {
      order.po_items.forEach(item => {
        allItems.push(item);
      });
    });
    return allItems;
  }
};

export async function getPurchaseOrderDetailsBySupplierAndDate(supplierCode: string, date: string) {
  const url = `${API_BASE_URL}/raw/po/get/?supplier=${encodeURIComponent(supplierCode)}&date=${date}`;
  try {
    const data = await apiFetch<any>(url);
    return data;
  } catch (error) {
    console.error('Error fetching purchase order details by supplier and date:', error);
    throw error;
  }
}

export async function saveProductPOResult(params: {
  po_id: number;
  product_id: number;
  weight: number;
  photo: File;
  color?: number;
  fat_percentage?: number;
  meat_percentage?: number;
}): Promise<any> {
  const formData = new FormData();
  formData.append('po_id', String(params.po_id));
  formData.append('product_id', String(params.product_id));
  formData.append('weight', String(params.weight));
  formData.append('photo', params.photo);
  if (params.color !== undefined) formData.append('color', String(params.color));
  if (params.fat_percentage !== undefined) formData.append('fat_percentage', String(params.fat_percentage));
  if (params.meat_percentage !== undefined) formData.append('meat_percentage', String(params.meat_percentage));

  const response = await fetch(`${API_BASE_URL}/raw/po/product`, {
    method: 'POST',
    body: formData
  });
  if (!response.ok) {
    throw new Error('API error: ' + response.status);
  }
  return response.json();
}

export async function removeProductPOResult(item_id: number): Promise<any> {
  const formData = new FormData();
  formData.append('item_id', String(item_id));
  const response = await fetch(`${API_BASE_URL}/raw/po/product/remove`, {
    method: 'POST',
    body: formData
  });
  if (!response.ok) {
    throw new Error('API error: ' + response.status);
  }
  console.log("success");
  return response.json();
}

export async function getProductPOResults(po_id: number, product_id: number): Promise<any[]> {
  const url = `${API_BASE_URL}//raw/po/product/get?po_id=${po_id}&product_id=${product_id}`;
  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    throw new Error('API error: ' + response.status);
  }
  console.log("success");
  return response.json();
}

export async function receiveAllPOResult(params: {
  po_id: number;
  items: { product_id: number; status: number }[];
}): Promise<any> {
  const formData = new FormData();
  formData.append('po_id', String(params.po_id));
  formData.append('items', JSON.stringify(params.items));

  console.log("formData", formData.get('items'));
  console.log("po_id", formData.get('po_id'));
  const response = await fetch(`${API_BASE_URL}/raw/po/result`, {
    method: 'POST',
    body: formData
  });
  if (!response.ok) {
    throw new Error('API error: ' + response.status);
  }
  return response.json();
} 