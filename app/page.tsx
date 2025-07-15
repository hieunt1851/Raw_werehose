'use client';

import { Warehouse } from 'lucide-react';
import { SensorCard } from '@/components/SensorCard';
import { SupplierCard } from '@/components/SupplierCard';
import { SavedDataCard } from '@/components/SavedDataCard';
import { ToastContainer } from '@/components/ToastContainer';
import { useWarehouse } from '@/hooks/useWarehouse';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { getYesterdayDate } from '@/utils/date';

export default function Home() {
  const {
    currentSupplier,
    savedItems,
    handleSupplierChange,
    handleMaterialsChange,
    handlePhotoAnalysis,
    deleteSavedItem
  } = useWarehouse();

  const { 
    suppliersWithOrders, 
    getOrderItems, 
    getOrdersBySupplier 
  } = usePurchaseOrders(getYesterdayDate());

  // Get API order items for the current supplier
  const getApiOrderItemsForSupplier = () => {
    if (!currentSupplier) return [];
    
    // Find the supplier data for the current supplier
    const currentSupplierData = suppliersWithOrders.find(s => s.code === currentSupplier);
    if (!currentSupplierData) return [];
    
    const orders = getOrdersBySupplier(currentSupplierData.id);
    return getOrderItems(orders);
  };

  const apiOrderItems = getApiOrderItemsForSupplier();

  return (
    <div className="container mt-2 mb-2">
      <h2 className="mb-2">
        <Warehouse className="me-2" size={24} />
        AI SYSTEM
      </h2>
      
      <div className="row">
        <div className="col-lg-6 mb-2">
          <SensorCard 
            currentSupplier={currentSupplier}
            onPhotoAnalysis={handlePhotoAnalysis}
            apiOrderItems={apiOrderItems}
          />
        </div>
        
        <div className="col-lg-6 mb-2">
          <SupplierCard 
            currentSupplier={currentSupplier}
            onSupplierChange={handleSupplierChange}
            onMaterialsChange={handleMaterialsChange}
          />
          
          <div className="mt-4">
            <SavedDataCard 
              savedItems={savedItems} 
              onDeleteItem={deleteSavedItem}
            />
          </div>
        </div>
      </div>
      
      <ToastContainer />
    </div>
  );
} 