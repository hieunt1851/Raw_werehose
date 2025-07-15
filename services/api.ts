import { Supplier, ApiPurchaseOrderResponse, ApiOrder, ApiOrderItem } from '@/types';

// API base URL
const API_BASE_URL = 'https://ai.block8910.com/api/dev';

// API interface for supplier data
interface ApiSupplier {
  id: number;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

// Generic API error handler
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic fetch wrapper with error handling
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

// Supplier API functions
export const supplierApi = {
  // Get all suppliers
  async getSuppliers(): Promise<Supplier[]> {
    try {
      const data: ApiSupplier[] = await apiFetch<ApiSupplier[]>(`${API_BASE_URL}/raw/supplier/get/`);
      
      // Transform API data to our Supplier interface
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
      
      // Return fallback data if API fails
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

  // Get suppliers by IDs
  async getSuppliersByIds(supplierIds: number[]): Promise<Supplier[]> {
    try {
      const allSuppliers = await this.getSuppliers();
      return allSuppliers.filter(supplier => supplierIds.includes(supplier.id));
    } catch (error) {
      console.error('Error fetching suppliers by IDs:', error);
      return [];
    }
  },

  // Get supplier by ID
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

  // Create new supplier
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

  // Update supplier
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

  // Delete supplier
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

// Purchase Order API functions
export const purchaseOrderApi = {
  // Get purchase orders for a specific date
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

  // Get unique supplier IDs from orders
  getUniqueSupplierIds(orders: ApiOrder[]): number[] {
    return orders.map(order => order.po_supplier_id);
  },

  // Get orders for a specific supplier
  getOrdersBySupplier(orders: ApiOrder[], supplierId: number): ApiOrder[] {
    return orders.filter(order => order.po_supplier_id === supplierId);
  },

  // Get all products for a supplier's orders
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

// Get purchase order details for a specific supplier and date
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

// Local analysis API for color difference analysis
export interface AnalysisRequest {
  url1: string;
  base2: string;
  product_kind: string;
  mode: string;
}

export interface AnalysisResponse {
  color_difference: number;
  [key: string]: any;
}

export async function analyzeImage(request: AnalysisRequest): Promise<AnalysisResponse> {
  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout

  try {
    const response = await fetch('http://127.0.0.1:5000/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId); // Clear timeout if request completes
    
    if (!response.ok) {
      throw new ApiError(response.status, `Analysis API error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId); // Clear timeout on error
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Analysis API request timed out after 5 seconds');
    }
    
    console.error('Error calling local analysis API:', error);
    throw error;
  }
} 