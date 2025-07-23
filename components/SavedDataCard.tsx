'use client';

import { useState } from 'react';
import { SavedItem } from '@/types';
import { Eye, Trash2, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { SavedItemDetailModal } from './SavedItemDetailModal';
import { removeProductPOResult } from '@/services/remoteApi';

interface SavedDataCardProps {
  savedItems: SavedItem[];
  onDeleteItem?: (index: number) => void;
  externalSavedItems?: Array<{
    item_id?: number;
    product_id?: number;
    quantity: string | number;
    color: string | number;
    created_at?: string;
    unit?: string;
  }>;
  externalProductInfo?: { code: string; name: string } | null;
}

export function SavedDataCard({ savedItems, onDeleteItem, externalSavedItems = [], externalProductInfo }: SavedDataCardProps) {
  const [selectedItem, setSelectedItem] = useState<SavedItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const groupedItems = savedItems.reduce((acc, item, index) => {
    const key = item.material.slug;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push({ ...item, originalIndex: index });
    return acc;
  }, {} as Record<string, (SavedItem & { originalIndex: number })[]>);

  const toggleGroup = (slug: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [slug]: !prev[slug]
    }));
  };

  const handleViewDetails = (item: SavedItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (index: number) => {
    const item = savedItems[index];
    if (confirm('Bạn có chắc muốn xóa mục này?')) {
      if (item && item.item_id) {
        try {
          await removeProductPOResult(item.item_id);
        } catch (err) {
          (window as any).showToast?.('Lỗi khi xóa dữ liệu trên server.', 'danger');
        }
      }
      onDeleteItem?.(index);
      (window as any).showToast?.('Đã xóa mục thành công.', 'success');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const calculateGroupTotal = (items: (SavedItem & { originalIndex: number })[]) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Thông tin đã lưu trữ</h5>
            {savedItems.length > 0 && (
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => {
                    if (confirm('Bạn có chắc muốn xóa tất cả dữ liệu đã lưu?')) {
                      savedItems.forEach((_, index) => onDeleteItem?.(index));
                      (window as any).showToast?.('Đã xóa tất cả dữ liệu.', 'success');
                    }
                  }}
                  title="Xóa tất cả"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="card-body">
          {externalSavedItems.length > 0 && externalProductInfo ? (
            <div className="mb-4">
              {/* Aggregate external items by product (similar to confirmation modal) */}
              {(() => {
                const aggregatedExternalItems = externalSavedItems.reduce((acc, item) => {
                  const productId = String(item.product_id || 'unknown');
                  if (!acc[productId]) {
                    acc[productId] = {
                      product_id: productId,
                      totalQuantity: 0,
                      totalColorDiff: 0,
                      count: 0,
                      firstTimestamp: item.created_at ? new Date(item.created_at) : new Date(),
                      unit: item.unit || 'kg' // Default unit if not provided
                    };
                  }
                  acc[productId].totalQuantity += parseFloat(String(item.quantity || 0));
                  acc[productId].totalColorDiff += parseFloat(String(item.color || 0));
                  acc[productId].count += 1;
                  if (item.created_at && new Date(item.created_at) < acc[productId].firstTimestamp) {
                    acc[productId].firstTimestamp = new Date(item.created_at);
                  }
                  return acc;
                }, {} as Record<string, {
                  product_id: string;
                  totalQuantity: number;
                  totalColorDiff: number;
                  count: number;
                  firstTimestamp: Date;
                  unit: string;
                }>);

                const aggregatedArray = Object.values(aggregatedExternalItems);

                return (
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th className="text-center">STT</th>
                          <th className="text-center">NVL</th>
                          <th className="text-center">Tổng định lượng</th>
                          <th className="text-center">Đơn vị</th>
                          <th className="text-center">Số lần đo</th>
                          <th className="text-center" style={{ fontSize: '10px' }}>
                            Trung bình <br/> khác biệt màu sắc
                          </th>
                          <th className="text-center">Thời gian đầu tiên</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aggregatedArray.map((item, idx) => {
                          const avgColorDiff = item.totalColorDiff / item.count;
                          const hasWarning = avgColorDiff > 5;
                          
                          return (
                            <tr key={item.product_id}>
                              <td className="text-center">{idx + 1}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <span className="me-2">{externalProductInfo.code} - {externalProductInfo.name}</span>
                                  {hasWarning && (
                                    <span title="Cần kiểm tra">
                                      <AlertTriangle className="text-warning" size={14} />
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="text-center">
                                <span className="fw-bold text-success">
                                  {item.totalQuantity.toFixed(3)}
                                </span>
                              </td>
                              <td className="text-center">
                                <span className="fw-bold">{item.unit}</span>
                              </td>
                              <td className="text-center">
                                <span className="fw-bold">{item.count}</span>
                              </td>
                              <td className="text-center">
                                <span className={`fw-bold ${avgColorDiff > 5 ? 'text-danger' : 'text-success'}`}>
                                  {avgColorDiff.toFixed(2)}%
                                </span>
                              </td>
                              <td className="text-center">
                                {item.firstTimestamp.toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          ) : Object.keys(groupedItems).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(groupedItems).map(([slug, items]) => {
                const isExpanded = expandedGroups[slug] ?? true;
                const totalWeight = calculateGroupTotal(items);
                return (
                  <div key={slug} className="saved-data-group">
                    {/* Group Header */}
                    <div
                      className="saved-data-header d-flex align-items-center justify-content-between"
                      onClick={() => toggleGroup(slug)}
                    >
                      <div className="d-flex align-items-center">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <span className="ms-2 fw-bold">
                          {items[0].material.code} - {items[0].material.name} - Tổng: {totalWeight.toFixed(3)} {items[0].material.unit}
                        </span>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-light"
                          onClick={e => {
                            e.stopPropagation();
                            if (confirm(`Bạn có chắc muốn xóa tất cả dữ liệu của ${items[0].material.name}?`)) {
                              items.forEach(item => onDeleteItem?.(item.originalIndex));
                              (window as any).showToast?.('Đã xóa nhóm dữ liệu.', 'success');
                            }
                          }}
                          title="Xóa nhóm này"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {/* Group Content */}
                    {isExpanded && (
                      <div className="p-3">
                        <div className="d-flex flex-wrap gap-2">
                          {items.map((item, index) => (
                            <div key={item.originalIndex} className="saved-data-badge position-relative">
                              <span
                                className={`badge rounded-pill px-3 py-2 fs-6 ${
                                  item.colorDiff > 5 ? 'bg-danger' :
                                  item.colorDiff > 2 ? 'bg-warning' : 'bg-primary'
                                } text-white`}
                                onClick={() => handleViewDetails(item)}
                                title="Nhấp để xem chi tiết"
                                style={{ cursor: 'pointer' }}
                              >
                                Lần {index + 1}: {item.quantity.toFixed(3)} {item.material.unit} - {item.colorDiff.toFixed(2)}%
                              </span>
                              <button
                                type="button"
                                className="position-absolute bg-danger border-0 rounded-circle d-flex align-items-center justify-content-center text-white"
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  fontSize: '10px',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                  zIndex: 10,
                                  top: '-6px',
                                  right: '-6px',
                                  transform: 'none'
                                }}
                                onClick={e => {
                                  e.stopPropagation();
                                  handleDeleteItem(item.originalIndex);
                                }}
                                title="Xóa mục này"
                              >
                                <svg
                                  width="8"
                                  height="8"
                                  viewBox="0 0 12 12"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M9 3L3 9M3 3L9 9"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-muted">
              <div className="py-4">
                <AlertTriangle className="mb-2" size={48} />
                <div>Chưa có dữ liệu được lưu trữ</div>
                <small>Dữ liệu sẽ xuất hiện sau khi phân tích và lưu trữ</small>
              </div>
            </div>
          )}
        </div>
      </div>
      <SavedItemDetailModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
} 