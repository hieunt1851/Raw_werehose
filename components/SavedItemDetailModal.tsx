'use client';

import { SavedItem } from '@/types';
import { X, Calendar, Scale, Palette, Package } from 'lucide-react';

interface SavedItemDetailModalProps {
  item: SavedItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SavedItemDetailModal({ item, isOpen, onClose }: SavedItemDetailModalProps) {
  if (!item) return null;

  return (
    <>
      {isOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <Package className="me-2" size={20} />
                  Chi tiết vật liệu đã lưu
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  aria-label="Close"
                ></button>
              </div>
              
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="card-title mb-0">
                          <Package className="me-2" size={16} />
                          Thông tin vật liệu
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <strong>Mã vật liệu:</strong>
                          <div className="text-primary">{item.material.code}</div>
                        </div>
                        <div className="mb-3">
                          <strong>Tên vật liệu:</strong>
                          <div>{item.material.name}</div>
                        </div>
                        <div className="mb-3">
                          <strong>Đơn vị:</strong>
                          <div>{item.material.unit}</div>
                        </div>
                        <div className="mb-3">
                          <strong>Định lượng chuẩn:</strong>
                          <div>{item.material.quantity.toFixed(2)} {item.material.unit}</div>
                        </div>
                        <div className="mb-3">
                          <strong>Khoảng cho phép:</strong>
                          <div className="text-info">{item.material.between}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="card-title mb-0">
                          <Scale className="me-2" size={16} />
                          Kết quả phân tích
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <strong>Định lượng thực tế:</strong>
                          <div className="text-success fw-bold">
                            {item.quantity.toFixed(3)} {item.material.unit}
                          </div>
                        </div>
                        <div className="mb-3">
                          <strong>Khác biệt màu sắc:</strong>
                          <div className={`fw-bold ${item.colorDiff > 5 ? 'text-danger' : 'text-success'}`}>
                            {item.colorDiff.toFixed(2)}%
                          </div>
                        </div>
                        <div className="mb-3">
                          <strong>Thời gian phân tích:</strong>
                          <div className="text-muted">
                            <Calendar className="me-1" size={14} />
                            {item.timestamp.toLocaleString()}
                          </div>
                        </div>
                        <div className="mb-3">
                          <strong>Trạng thái:</strong>
                          <div className={`badge ${item.colorDiff > 5 ? 'bg-warning' : 'bg-success'}`}>
                            {item.colorDiff > 5 ? 'Cần kiểm tra' : 'Đạt chuẩn'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="row mt-3">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="card-title mb-0">
                          <Palette className="me-2" size={16} />
                          Hình ảnh phân tích
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6">
                            <div className="text-center mb-2">
                              <strong>Hình chuẩn</strong>
                            </div>
                            <div className="p-2">
                              <img 
                                className="rounded border border-1 w-100" 
                                src={item.standardImage}
                                alt="Standard"
                                style={{ maxHeight: '200px', objectFit: 'cover' }}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="text-center mb-2">
                              <strong>Hình chụp</strong>
                            </div>
                            <div className="p-2">
                              <img 
                                className="rounded border border-1 w-100" 
                                src={item.capturedImage}
                                alt="Captured"
                                style={{ maxHeight: '200px', objectFit: 'cover' }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="row mt-3">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="card-title mb-0">
                          <Palette className="me-2" size={16} />
                          Đánh giá chất lượng
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-4">
                            <div className="text-center">
                              <div className="h4 mb-1">Định lượng</div>
                              <div className={`h5 ${Math.abs(item.quantity - item.material.quantity) > 0.1 ? 'text-warning' : 'text-success'}`}>
                                {item.quantity.toFixed(3)} {item.material.unit}
                              </div>
                              <small className="text-muted">
                                Chuẩn: {item.material.quantity.toFixed(3)} {item.material.unit}
                              </small>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="text-center">
                              <div className="h4 mb-1">Màu sắc</div>
                              <div className={`h5 ${item.colorDiff > 5 ? 'text-warning' : 'text-success'}`}>
                                {item.colorDiff.toFixed(2)}%
                              </div>
                              <small className="text-muted">
                                Ngưỡng: 5%
                              </small>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="text-center">
                              <div className="h4 mb-1">Tổng đánh giá</div>
                              <div className={`h5 ${item.colorDiff > 5 || Math.abs(item.quantity - item.material.quantity) > 0.1 ? 'text-warning' : 'text-success'}`}>
                                {item.colorDiff > 5 || Math.abs(item.quantity - item.material.quantity) > 0.1 ? 'Cần kiểm tra' : 'Đạt chuẩn'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  <X className="me-1" size={16} />
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 