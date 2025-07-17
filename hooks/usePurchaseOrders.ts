'use client';

import { useState, useEffect } from 'react';
import { Supplier, ApiPurchaseOrderResponse, ApiOrder, ApiOrderItem } from '@/types';
import { supplierApi, purchaseOrderApi } from '@/services/remoteApi';
import { getYesterdayDate } from '@/utils/date';

export function usePurchaseOrders(date: string = getYesterdayDate()) {
  const [suppliersWithOrders, setSuppliersWithOrders] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<ApiPurchaseOrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPurchaseOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch purchase orders for the specified date
        const ordersData = await purchaseOrderApi.getPurchaseOrders(date);
        setPurchaseOrders(ordersData);
        
        // Extract suppliers from orders
        const suppliers = ordersData.orders.map(order => ({
          id: order.po_supplier_id,
          code: order.po_supplier_code,
          name: order.po_supplier_name,
          phone: '',
          email: '',
          address: ''
        }));
        setSuppliersWithOrders(suppliers);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch purchase orders');
        console.error('Error loading purchase orders:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPurchaseOrders();
  }, [date]);

  const refreshPurchaseOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const ordersData = await purchaseOrderApi.getPurchaseOrders(date);
      setPurchaseOrders(ordersData);
      
      const suppliers = ordersData.orders.map(order => ({
        id: order.po_supplier_id,
        code: order.po_supplier_code,
        name: order.po_supplier_name,
        phone: '',
        email: '',
        address: ''
      }));
      setSuppliersWithOrders(suppliers);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh purchase orders');
      console.error('Error refreshing purchase orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getOrdersBySupplier = (supplierId: number): ApiOrder[] => {
    if (!purchaseOrders) return [];
    return purchaseOrderApi.getOrdersBySupplier(purchaseOrders.orders, supplierId);
  };

  const getOrderItems = (orders: ApiOrder[]): ApiOrderItem[] => {
    return purchaseOrderApi.getOrderItems(orders);
  };

  return {
    suppliersWithOrders,
    purchaseOrders,
    loading,
    error,
    refreshPurchaseOrders,
    getOrdersBySupplier,
    getOrderItems
  };
} 