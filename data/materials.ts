import { RawMaterial, PurchaseOrder, Supplier } from '@/types';

export const po_meat: RawMaterial[] = [
  { 
    id: 1, 
    code: 'NVL_THIT001', 
    name: 'Thịt bò', 
    unit: 'kg', 
    quantity: 8.00, 
    diff: 1, 
    slug: 'thit_bo', 
    between: '7.92 -> 8.08', 
    real: 7.90 
  },
  { 
    id: 2, 
    code: 'NVL_THIT002', 
    name: 'Thịt gà', 
    unit: 'kg', 
    quantity: 6.00, 
    diff: 2, 
    slug: 'thit_ga', 
    between: '5.88 -> 6.12', 
    real: 5.50 
  },
  { 
    id: 3, 
    code: 'NVL_THIT003', 
    name: 'Thịt heo', 
    unit: 'kg', 
    quantity: 5.00, 
    diff: 3, 
    slug: 'thit_heo', 
    between: '4.85 -> 5.15', 
    real: 5.30 
  },
];

export const po_meat_orders: PurchaseOrder[] = [
  {
    code: '20250707ORDER001',
    items: [
      { code: 'NVL_THIT001', name: 'Thịt bò', unit: 'kg', quantity: 4.00 },
      { code: 'NVL_THIT002', name: 'Thịt gà', unit: 'kg', quantity: 2.00 },
    ],
  },
  {
    code: '20250707ORDER002',
    items: [
      { code: 'NVL_THIT001', name: 'Thịt bò', unit: 'kg', quantity: 4.00 },
      { code: 'NVL_THIT002', name: 'Thịt gà', unit: 'kg', quantity: 4.00 },
    ],
  },
  {
    code: '20250707ORDER003',
    items: [
      { code: 'NVL_THIT003', name: 'Thịt heo', unit: 'kg', quantity: 5.00 },
    ],
  },
];

export const po_seafood: RawMaterial[] = [
  { 
    id: 1, 
    code: 'NVL_HS004', 
    name: 'Tôm sú', 
    unit: 'kg', 
    quantity: 5.00, 
    diff: 2, 
    slug: 'tom_su', 
    between: '4.90 -> 5.10', 
    real: 5.30 
  },
  { 
    id: 2, 
    code: 'NVL_HS005', 
    name: 'Mực lá', 
    unit: 'kg', 
    quantity: 8.00, 
    diff: 3, 
    slug: 'muc_la', 
    between: '7.76 -> 8.24', 
    real: 8.20 
  },
];

export const po_seafood_orders: PurchaseOrder[] = [
  {
    code: '20250707ORDER004',
    items: [
      { code: 'NVL_HS004', name: 'Tôm sú', unit: 'kg', quantity: 1.00 },
      { code: 'NVL_HS005', name: 'Mực lá', unit: 'kg', quantity: 2.00 },
    ],
  },
  {
    code: '20250707ORDER005',
    items: [
      { code: 'NVL_HS004', name: 'Tôm sú', unit: 'kg', quantity: 4.00 },
      { code: 'NVL_HS005', name: 'Mực lá', unit: 'kg', quantity: 6.00 },
    ],
  },
];

// Legacy static suppliers (fallback)
export const suppliers = {
  meat: {
    code: 'NCC_MEAT',
    name: 'CTY Meat',
    phone: '090 123 4567'
  },
  seafood: {
    code: 'NCC_SEAFOOD',
    name: 'CTY Seafood',
    phone: '090 456 7890'
  }
}; 