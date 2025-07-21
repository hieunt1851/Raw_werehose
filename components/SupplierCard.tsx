'use client';

import { useState } from 'react';
import { Eye, RefreshCw, Calendar } from 'lucide-react';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { po_meat, po_seafood, po_meat_orders, po_seafood_orders } from '@/data/materials';
import { RawMaterial, PurchaseOrder, ApiOrder } from '@/types';
import { getYesterdayDate, formatDate } from '@/utils/date';
import { getPurchaseOrderDetailsBySupplierAndDate, getProductPOResults } from '@/services/remoteApi';
import { SavedDataCard } from './SavedDataCard';

interface SupplierCardProps {
  currentSupplier: string;
  onSupplierChange: (supplier: string) => void;
  onMaterialsChange: (materials: RawMaterial[]) => void;
  onClearSavedItems: () => void;
  hasSavedItems: boolean;
}

export function SupplierCard({ currentSupplier, onSupplierChange, onMaterialsChange, onClearSavedItems, hasSavedItems }: SupplierCardProps) {
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getYesterdayDate());
  const [detailedOrderData, setDetailedOrderData] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [pendingSupplier, setPendingSupplier] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [externalSavedItems, setExternalSavedItems] = useState<any[]>([]);
  const [externalProductInfo, setExternalProductInfo] = useState<{ code: string; name: string } | null>(null);
  
  const { 
    suppliersWithOrders, 
    purchaseOrders, 
    loading, 
    error, 
    refreshPurchaseOrders,
    getOrdersBySupplier,
    getOrderItems
  } = usePurchaseOrders(selectedDate);

  const handleSupplierChange = (supplierCode: string) => {
    if (currentSupplier && currentSupplier !== supplierCode && hasSavedItems) {
      setPendingSupplier(supplierCode);
      setShowConfirmModal(true);
      return;
    }
    if (currentSupplier && currentSupplier !== supplierCode) {
      onClearSavedItems();
      onSupplierChange(supplierCode);
      const supplier = suppliersWithOrders.find(s => s.code === supplierCode);
      if (supplier) {
        const orders = getOrdersBySupplier(supplier.id);
        const materials = getOrderItems(orders).map(item => ({
          id: item.product_id,
          code: item.product_code,
          name: item.product_name,
          unit: item.unit_name,
          quantity: parseFloat(item.quantity),
          diff: 2,
          slug: item.product_code.toLowerCase().replace(/\s+/g, '_'),
          between: `${(parseFloat(item.quantity) * 0.98).toFixed(2)} -> ${(parseFloat(item.quantity) * 1.02).toFixed(2)}`,
          real: parseFloat(item.quantity),
          product_photo: item.product_photo
        }));
        onMaterialsChange(materials);
      } else {
        onMaterialsChange([]);
      }
    } else {
      onSupplierChange(supplierCode);
      const supplier = suppliersWithOrders.find(s => s.code === supplierCode);
      if (supplier) {
        const orders = getOrdersBySupplier(supplier.id);
        const materials = getOrderItems(orders).map(item => ({
          id: item.product_id,
          code: item.product_code,
          name: item.product_name,
          unit: item.unit_name,
          quantity: parseFloat(item.quantity),
          diff: 2,
          slug: item.product_code.toLowerCase().replace(/\s+/g, '_'),
          between: `${(parseFloat(item.quantity) * 0.98).toFixed(2)} -> ${(parseFloat(item.quantity) * 1.02).toFixed(2)}`,
          real: parseFloat(item.quantity),
          product_photo: item.product_photo
        }));
        onMaterialsChange(materials);
      } else {
        onMaterialsChange([]);
      }
    }
  };

  const handleConfirmChange = () => {
    if (pendingSupplier) {
      onClearSavedItems();
      onSupplierChange(pendingSupplier);
      const supplier = suppliersWithOrders.find(s => s.code === pendingSupplier);
      if (supplier) {
        const orders = getOrdersBySupplier(supplier.id);
        const materials = getOrderItems(orders).map(item => ({
          id: item.product_id,
          code: item.product_code,
          name: item.product_name,
          unit: item.unit_name,
          quantity: parseFloat(item.quantity),
          diff: 2,
          slug: item.product_code.toLowerCase().replace(/\s+/g, '_'),
          between: `${(parseFloat(item.quantity) * 0.98).toFixed(2)} -> ${(parseFloat(item.quantity) * 1.02).toFixed(2)}`,
          real: parseFloat(item.quantity),
          product_photo: item.product_photo
        }));
        onMaterialsChange(materials);
      } else {
        onMaterialsChange([]);
      }
    }
    setShowConfirmModal(false);
    setPendingSupplier(null);
  };

  const handleCancelChange = () => {
    setShowConfirmModal(false);
    setPendingSupplier(null);
  };

  const viewOrderDetails = async () => {
    if (!currentSupplier) {
      (window as any).showToast?.('Vui lòng chọn nhà cung cấp trước khi xem chi tiết đơn hàng.', 'danger');
      return;
    }
    setShowOrderDetails(true);
    setLoadingDetail(true);
    setErrorDetail(null);
    setDetailedOrderData(null);

    try {
      const supplier = suppliersWithOrders.find(s => s.code === currentSupplier);
      if (!supplier) return;
      const data = await getPurchaseOrderDetailsBySupplierAndDate(supplier.code, selectedDate);
      setDetailedOrderData(data);
    } catch (err) {
      setDetailedOrderData(null);
      setErrorDetail('Lỗi khi tải chi tiết đơn hàng.');
      (window as any).showToast?.('Lỗi khi tải chi tiết đơn hàng.', 'danger');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handler for clicking Mã SP
  const handleProductCellClick = async (po_id: number, product_id: number, code: string, name: string) => {
    try {
      const results = await getProductPOResults(po_id, product_id);
      setExternalSavedItems(results);
      setExternalProductInfo({ code, name });
    } catch (err) {
      setExternalSavedItems([]);
      setExternalProductInfo(null);
      (window as any).showToast?.('Lỗi khi tải dữ liệu sản phẩm.', 'danger');
    }
  };

  const currentSupplierData = suppliersWithOrders.find(s => s.code === currentSupplier);
  const currentMaterials = currentSupplier === 'meat' ? po_meat : po_seafood;
  const currentOrders = currentSupplier === 'meat' ? po_meat_orders : po_seafood_orders;

  // Get API orders for current supplier
  const getApiOrdersForSupplier = () => {
    if (!currentSupplierData || !purchaseOrders) return [];
    return getOrdersBySupplier(currentSupplierData.id);
  };

  const apiOrders = getApiOrdersForSupplier();
  const apiOrderItems = getOrderItems(apiOrders);

  // Build a mapping from product_id to po_id
  const productIdToPoId: Record<number, number> = {};
  apiOrders.forEach(order => {
    order.po_items.forEach((item: any) => {
      productIdToPoId[item.product_id] = order.po_id;
    });
  });

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between">
            <h5 className="card-title">Thông tin nhà cung cấp</h5>
            <div className="d-flex gap-2">
              {/*
              <div className="d-flex align-items-center gap-2">
                <Calendar size={16} />
                <input 
                  type="date" 
                  className="form-control form-control-sm" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ width: 'auto' }}
                  title={`Đơn hàng ngày: ${formatDate(selectedDate)}`}
                />
              </div>
              */}
              <button 
                type="button" 
                className="btn btn-sm btn-outline-secondary" 
                onClick={refreshPurchaseOrders}
                disabled={loading}
                title="Refresh orders"
              >
                <RefreshCw className={`me-1 ${loading ? 'animate-spin' : ''}`} size={16} />
                {loading ? 'Loading...' : 'Refresh'}
              </button>
              <select 
                name="ncc" 
                className="form-select" 
                value={currentSupplier}
                onChange={(e) => handleSupplierChange(e.target.value)}
                disabled={loading}
              >
                <option value="">Hãy chọn nhà cung cấp</option>
                {suppliersWithOrders.map((supplier) => (
                  <option key={supplier.id} value={supplier.code}>
                    {supplier.name} ({supplier.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="card-body">
          {error && (
            <div className="alert alert-danger mb-3">
              <strong>Error loading orders:</strong> {error}
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading purchase orders for {formatDate(selectedDate)}...</p>
            </div>
          ) : (
            <>
              {/*
              {purchaseOrders && (
                <div className="alert alert-info mb-3">
                  <strong>Warehouse:</strong> {purchaseOrders.warehouse_name} ({purchaseOrders.warehouse_code})<br/>
                  <strong>Total Orders:</strong> {purchaseOrders.total_orders}<br/>
                  <strong>Suppliers with Orders:</strong> {suppliersWithOrders.length}<br/>
                  <strong>Date:</strong> {formatDate(selectedDate)}
                </div>
              )}
              */}

              <div className="d-flex justify-content-between mt-1">
                <div>Mã NCC</div>
                <div className="fw-bold">{currentSupplierData?.code || '-'}</div>
              </div>

              <div className="d-flex justify-content-between mt-1">
                <div>Tên NCC</div>
                <div className="fw-bold">{currentSupplierData?.name || '-'}</div>
              </div>

              <div className="d-flex justify-content-between mt-1">
                <div>Điện thoại</div>
                <div className="fw-bold">{currentSupplierData?.phone || '-'}</div>
              </div>

              {currentSupplierData?.email && (
                <div className="d-flex justify-content-between mt-1">
                  <div>Email</div>
                  <div className="fw-bold">{currentSupplierData.email}</div>
                </div>
              )}

              {currentSupplierData?.address && (
                <div className="d-flex justify-content-between mt-1">
                  <div>Địa chỉ</div>
                  <div className="fw-bold">{currentSupplierData.address}</div>
                </div>
              )}

              {apiOrders.length > 0 && (
                <div className="d-flex justify-content-between mt-1">
                  <div>Số đơn hàng</div>
                  <div className="fw-bold">{apiOrders.length}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <div className="d-flex justify-content-between">
            <h5 className="card-title">Thông tin đơn hàng</h5>
            <button 
              type="button" 
              className="btn btn-sm btn-primary" 
              onClick={viewOrderDetails}
              disabled={!currentSupplier}
            >
              <Eye className="me-1" size={16} />
              Xem chi tiết
            </button>
          </div>
        </div>
        
        <div className="card-body">
          {apiOrderItems.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th className="text-center">STT</th>
                    <th className="text-center">Mã SP</th>
                    <th className="text-center">Tên sản phẩm</th>
                    <th className="text-center">Định lượng</th>
                    <th className="text-center">Đơn vị</th>
                    <th className="text-center" >
                      Sai số<br/>cho phép (%)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {apiOrderItems.map((item: any, index: number) => (
                    <tr key={`${item.product_id}-${index}`}>
                      <td className="text-center">{index + 1}</td>
                      <td className="text-center text-primary cursor-pointer" style={{textDecoration: 'underline'}} onClick={() => handleProductCellClick(productIdToPoId[item.product_id], item.product_id, item.product_code, item.product_name)}>{item.product_code}</td>
                      <td className="text-center">{item.product_name}</td>
                      <td className="text-center">{parseFloat(item.quantity).toFixed(2)}</td>
                      <td className="text-center">{item.unit_name}</td>
                      <td className="text-center">{item.product_diff_allowed || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : currentMaterials.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th className="text-center">STT</th>
                    <th className="text-center">NVL</th>
                    <th className="text-center">Định lượng</th>
                    <th className="text-center">Đơn vị</th>
                    <th className="text-center" style={{ fontSize: '10px' }}>
                      Sai số<br/>cho phép (%)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentMaterials.map((material, index) => (
                    <tr 
                      key={material.slug} 
                      className={`position-relative tr_${material.slug} cursor-pointer`}
                      onClick={() => {/* Handle material selection */}}
                    >
                      <td className="text-center">{material.id}</td>
                      <td className="text-center">{material.code} - {material.name}</td>
                      <td className="text-center">{material.quantity.toFixed(2)}</td>
                      <td className="text-center">{material.unit}</td>
                      <td className="text-center">{material.diff}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-muted">
              {loading ? 'Đang tải dữ liệu...' : 'Không có đơn hàng cho nhà cung cấp này'}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết đơn hàng - {formatDate(selectedDate)}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowOrderDetails(false)}
                ></button>
              </div>
              <div className="modal-body">
                {loadingDetail ? (
                  <div className="text-center py-3">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Đang tải chi tiết đơn hàng...</p>
                  </div>
                ) : errorDetail ? (
                  <div className="alert alert-danger">{errorDetail}</div>
                ) : detailedOrderData && detailedOrderData.orders && detailedOrderData.orders.length > 0 ? (
                  detailedOrderData.orders.map((order: any) => (
                    <div key={order.po_id} className="mb-4">
                      <h6>Đơn hàng: {order.po_id} - {order.po_supplier_name}</h6>
                      {order.po_orders && Object.entries(order.po_orders).map(([orderCode, items]: [string, unknown]) => (
                        <div key={orderCode} className="mb-2">
                          <div className="fw-bold">Mã đơn: {orderCode}</div>
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                <th>STT</th>
                                <th>Mã SP</th>
                                <th>Tên sản phẩm</th>
                                <th>Định lượng</th>
                                <th>Đơn vị</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(items as any[]).map((item, idx) => (
                                <tr key={idx}>
                                  <td>{idx + 1}</td>
                                  <td>{item.product_id}</td>
                                  <td>{item.product_name}</td>
                                  <td>{parseFloat(item.quantity).toFixed(2)}</td>
                                  <td>{item.unit_name}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted">Không có dữ liệu đơn hàng chi tiết</div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowOrderDetails(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Xác nhận thay đổi nhà cung cấp</h5>
                <button type="button" className="btn-close" onClick={handleCancelChange}></button>
              </div>
              <div className="modal-body">
                <p>Bạn có Thông tin đã lưu trữ. Bạn có chắc chắn muốn đổi nhà cung cấp không?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCancelChange}>Huỷ</button>
                <button type="button" className="btn btn-danger" onClick={handleConfirmChange}>Đồng ý đổi nhà cung cấp</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show external product PO results if available */}
      {externalSavedItems.length > 0 && externalProductInfo && (
        <div className="mt-4">
          <SavedDataCard
            savedItems={[]}
            externalSavedItems={externalSavedItems}
            externalProductInfo={externalProductInfo}
          />
        </div>
      )}
    </>
  );
} 