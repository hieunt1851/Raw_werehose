'use client';

import { Warehouse } from 'lucide-react';
import { SensorCard } from '@/components/SensorCard';
import { SupplierCard } from '@/components/SupplierCard';
import { SavedDataCard } from '@/components/SavedDataCard';
import { ToastContainer } from '@/components/ToastContainer';
import { useWarehouse } from '@/hooks/useWarehouse';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { getYesterdayDate } from '@/utils/date';
import { useState } from 'react';
import { SettingsModal } from '@/components/SettingsModal';

export default function Home() {
  const {
    currentSupplier,
    savedItems,
    handleSupplierChange,
    handleMaterialsChange,
    handlePhotoAnalysis,
    deleteSavedItem,
    clearSavedItems
  } = useWarehouse();

  const { 
    suppliersWithOrders, 
    getOrderItems, 
    getOrdersBySupplier 
  } = usePurchaseOrders(getYesterdayDate());

  const [showSettings, setShowSettings] = useState(false);
  const [weight, setWeight] = useState('');

  // Get API order items for the current supplier
  const getApiOrderItemsForSupplier = () => {
    if (!currentSupplier) return [];
    
    // Find the supplier data for the current supplier
    const currentSupplierData = suppliersWithOrders.find(s => s.code === currentSupplier);
    if (!currentSupplierData) return [];
    
    const orders = getOrdersBySupplier(currentSupplierData.id);
    return getOrderItems(orders);
  };

  // Get API orders for the current supplier
  const getApiOrdersForSupplier = () => {
    if (!currentSupplier) return [];
    const currentSupplierData = suppliersWithOrders.find(s => s.code === currentSupplier);
    if (!currentSupplierData) return [];
    return getOrdersBySupplier(currentSupplierData.id);
  };

  const apiOrders = getApiOrdersForSupplier();
  const apiOrderItems = getApiOrderItemsForSupplier();
  console.log(".");

  return (
    <div className="container mt-2 mb-2">
      <div className="d-flex justify-content-end mb-2">
        <button className="btn btn-outline-secondary" onClick={() => setShowSettings(true)}>
          <i className="fas fa-cog me-2"></i> Cài đặt cân
        </button>
      </div>
      <h2 className="mb-2 d-none">
        <Warehouse className="me-2" size={24} />
        AI SYSTEM
      </h2>
      
      <div className="row">
        <div className="col-lg-6 mb-2">
          <SensorCard 
            currentSupplier={currentSupplier}
            onPhotoAnalysis={handlePhotoAnalysis}
            apiOrderItems={apiOrderItems}
            apiOrders={apiOrders}
            savedItems={savedItems}
            weight={weight}
          />
        </div>
        
        <div className="col-lg-6 mb-2">
          <SupplierCard 
            currentSupplier={currentSupplier}
            onSupplierChange={handleSupplierChange}
            onMaterialsChange={handleMaterialsChange}
            onClearSavedItems={clearSavedItems}
            hasSavedItems={savedItems.length > 0}
          />
          
           <div className="mt-2">
            <SavedDataCard 
              savedItems={savedItems} 
              onDeleteItem={deleteSavedItem}
            />
           </div>
        </div>
      </div>
      
      <ToastContainer />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} weight={weight} setWeight={setWeight} />
    </div>
  );
} 