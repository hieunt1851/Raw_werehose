'use client';

import { useState, useEffect } from 'react';
import { Supplier } from '@/types';
import { supplierApi } from '@/services/remoteApi';

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await supplierApi.getSuppliers();
        setSuppliers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch suppliers');
        console.error('Error loading suppliers:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSuppliers();
  }, []);

  const refreshSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supplierApi.getSuppliers();
      setSuppliers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh suppliers');
      console.error('Error refreshing suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const createSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    try {
      const newSupplier = await supplierApi.createSupplier(supplier);
      setSuppliers(prev => [...prev, newSupplier]);
      return newSupplier;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create supplier');
      throw err;
    }
  };

  const updateSupplier = async (id: number, updates: Partial<Supplier>) => {
    try {
      const updatedSupplier = await supplierApi.updateSupplier(id, updates);
      setSuppliers(prev => prev.map(s => s.id === id ? updatedSupplier : s));
      return updatedSupplier;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update supplier');
      throw err;
    }
  };

  const deleteSupplier = async (id: number) => {
    try {
      const success = await supplierApi.deleteSupplier(id);
      if (success) {
        setSuppliers(prev => prev.filter(s => s.id !== id));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete supplier');
      throw err;
    }
  };

  return {
    suppliers,
    loading,
    error,
    refreshSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier
  };
} 