'use client';

import { useState, useCallback } from 'react';
import { RawMaterial, PhotoAnalysis, SavedItem } from '@/types';

export function useWarehouse() {
  const [currentSupplier, setCurrentSupplier] = useState('');
  const [currentMaterials, setCurrentMaterials] = useState<RawMaterial[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  const handleSupplierChange = useCallback((supplier: string) => {
    setCurrentSupplier(supplier);
  }, []);

  const handleMaterialsChange = useCallback((materials: RawMaterial[]) => {
    setCurrentMaterials(materials);
  }, []);

  const handlePhotoAnalysis = useCallback((analysis: PhotoAnalysis) => {
    const savedItem: SavedItem = {
      material: analysis.predictedMaterial,
      quantity: analysis.quantity,
      colorDiff: analysis.colorDiff,
      timestamp: new Date(),
      standardImage: analysis.standardImage,
      capturedImage: analysis.capturedImage,
      item_id: analysis.item_id
    };
    
    setSavedItems(prev => [...prev, savedItem]);
  }, []);

  const deleteSavedItem = useCallback((index: number) => {
    setSavedItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearSavedItems = useCallback(() => {
    setSavedItems([]);
  }, []);

  return {
    currentSupplier,
    currentMaterials,
    savedItems,
    handleSupplierChange,
    handleMaterialsChange,
    handlePhotoAnalysis,
    deleteSavedItem,
    clearSavedItems
  };
} 