'use client';

import { useState } from 'react';
import { SavedItem } from '@/types';
import { Eye, Trash2, AlertTriangle } from 'lucide-react';
import { SavedItemDetailModal } from './SavedItemDetailModal';

interface SavedDataCardProps {
  savedItems: SavedItem[];
  onDeleteItem?: (index: number) => void;
}

export function SavedDataCard({ savedItems, onDeleteItem }: SavedDataCardProps) {
  const [selectedItem, setSelectedItem] = useState<SavedItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const groupedItems = savedItems.reduce((acc, item, index) => {
    const key = item.material.slug;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push({ ...item, originalIndex: index });
    return acc;
  }, {} as Record<string, (SavedItem & { originalIndex: number })[]>);

  const handleViewDetails = (item: SavedItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = (index: number) => {
    if (confirm('Bạn có chắc muốn xóa mục này?')) {
      onDeleteItem?.(index);
      (window as any).showToast?.('Đã xóa mục thành công.', 'success');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
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
          {Object.keys(groupedItems).length > 0 ? (
            Object.entries(groupedItems).map(([slug, items]) => (
              <div key={slug} className="mb-4">
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>{items[0].material.code} - {items[0].material.name}</th>
                        <th className="text-center">Định lượng</th>
                        <th className="text-center" style={{ fontSize: '10px' }}>
                          Khác biệt <br/> màu sắc
                        </th>
                        <th className="text-center" style={{ width: '120px' }}>
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.originalIndex}>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="me-2">{item.timestamp.toLocaleString()}</span>
                              {item.colorDiff > 5 && (
                                <span title="Cần kiểm tra">
                                  <AlertTriangle className="text-warning" size={14} />
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="text-center">
                            <span className={`fw-bold ${Math.abs(item.quantity - item.material.quantity) > 0.1 ? 'text-warning' : 'text-success'}`}>
                              {item.quantity.toFixed(2)} {item.material.unit}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className={`fw-bold ${item.colorDiff > 5 ? 'text-danger' : 'text-success'}`}>
                              {item.colorDiff.toFixed(2)}%
                            </span>
                          </td>
                          <td className="text-center">
                            <div className="btn-group btn-group-sm" role="group">
                              <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => handleViewDetails(item)}
                                title="Xem chi tiết"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteItem(item.originalIndex)}
                                title="Xóa mục này"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
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