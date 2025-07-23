'use client';

import { useState } from 'react';
import { SavedItem } from '@/types';
import { Eye, Trash2, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { SavedItemDetailModal } from './SavedItemDetailModal';

interface SavedDataCardProps {
  savedItems: SavedItem[];
  onDeleteItem?: (index: number) => void;
}

export function SavedDataCard({ savedItems, onDeleteItem }: SavedDataCardProps) {
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

  const calculateGroupTotal = (items: (SavedItem & { originalIndex: number })[]) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getColorDiffClass = (colorDiff: number) => {
    if (colorDiff > 5) return 'text-danger';
    if (colorDiff > 2) return 'text-warning';
    return 'text-success';
  };

  const getQuantityDiffClass = (actual: number, expected: number) => {
    const diff = Math.abs(actual - expected);
    if (diff > 0.5) return 'text-danger';
    if (diff > 0.1) return 'text-warning';
    return 'text-success';
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
                          {items[0].material.code} - {items[0].material.name} - Tổng: {totalWeight.toFixed(2)} {items[0].material.unit}
                        </span>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-light"
                          onClick={(e) => {
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
                            <div key={item.originalIndex} className="saved-data-badge">
                              <span
                                className={`badge rounded-pill px-3 py-2 fs-6 ${
                                  item.colorDiff > 5 ? 'bg-danger' :
                                  item.colorDiff > 2 ? 'bg-warning' : 'bg-primary'
                                } text-white`}
                                onClick={() => handleViewDetails(item)}
                                title="Nhấp để xem chi tiết"
                              >
                                Lần {index + 1}: {item.quantity.toFixed(2)} {item.material.unit} - {item.colorDiff.toFixed(2)}%
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
                                onClick={(e) => {
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
