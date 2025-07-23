'use client';

import { useState, useRef } from 'react';
import { Camera, Check, Bug, Upload, X, CircuitBoard, AlertTriangle } from 'lucide-react';
import { RawMaterial, PhotoAnalysis, ApiOrderItem, ApiOrder, SavedItem } from '@/types';
import { po_meat, po_seafood } from '@/data/materials';
import { numberRandom } from '@/utils/toast';
import { RoboflowService, RoboflowPrediction } from '@/services/roboflow';
import { analyzeImage, captureLocalImage } from '@/services/localApi';
import { saveProductPOResult, receiveAllPOResult } from '@/services/remoteApi';
import { Modal } from 'react-bootstrap';
import React from 'react'; // Added for useEffect

interface SensorCardProps {
  currentSupplier: string;
  onPhotoAnalysis: (analysis: PhotoAnalysis) => void;
  apiOrderItems?: ApiOrderItem[];
  apiOrders?: ApiOrder[];
  savedItems: SavedItem[];
  weight: string;
}

function SaveAllModal({ show, onClose, savedItems, apiOrders }: { show: boolean; onClose: () => void; savedItems: SavedItem[]; apiOrders?: ApiOrder[] }) {
  // Group items by product_id and calculate aggregated data
  const aggregatedItems = savedItems.reduce((acc, item, index) => {
    const productId = item.material.id;
    if (!acc[productId]) {
      acc[productId] = {
        material: item.material,
        totalQuantity: 0,
        totalColorDiff: 0,
        count: 0,
        originalIndices: [],
        firstTimestamp: item.timestamp
      };
    }
    acc[productId].totalQuantity += item.quantity;
    acc[productId].totalColorDiff += item.colorDiff;
    acc[productId].count += 1;
    acc[productId].originalIndices.push(index);
    return acc;
  }, {} as Record<number, {
    material: RawMaterial;
    totalQuantity: number;
    totalColorDiff: number;
    count: number;
    originalIndices: number[];
    firstTimestamp: Date;
  }>);

  // Local state for status of each product (1 = Nhập hàng, 0 = Trả hàng)
  const [statuses, setStatuses] = useState<number[]>(() => Object.keys(aggregatedItems).map(() => 1));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update statuses if aggregatedItems length changes
  React.useEffect(() => {
    setStatuses(Object.keys(aggregatedItems).map(() => 1));
  }, [Object.keys(aggregatedItems).length]);

  const handleStatusChange = (productIndex: number, value: number) => {
    setStatuses(prev => prev.map((s, i) => (i === productIndex ? value : s)));
  };

  // Find po_id for the current batch (assume all items are from the same po_id)
  let po_id: number | undefined = undefined;
  if (apiOrders && apiOrders.length > 0 && savedItems.length > 0) {
    for (const order of apiOrders) {
      if (order.po_items.some(item => item.product_id === savedItems[0].material.id)) {
        po_id = order.po_id;
        break;
      }
    }
  }

  const handleSubmit = async () => {
    if (!po_id) {
      (window as any).showToast?.('Không tìm thấy po_id cho các sản phẩm này.', 'danger');
      return;
    }
    setIsSubmitting(true);
    try {
      const items = Object.values(aggregatedItems).map((item, idx) => ({
        product_id: item.material.id,
        status: statuses[idx]
      }));
      const { receiveAllPOResult } = await import('@/services/remoteApi');
      await receiveAllPOResult({ po_id, items });
      (window as any).showToast?.('Đã gửi xác nhận hoàn tất lên server.', 'success');
      onClose();
    } catch (err) {
      (window as any).showToast?.('Lỗi khi gửi xác nhận hoàn tất.', 'danger');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const aggregatedItemsArray = Object.values(aggregatedItems);

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Xác nhận hoàn tất</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {aggregatedItemsArray.length > 0 ? (
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
                  <th className="text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {aggregatedItemsArray.map((item, idx) => {
                  const avgColorDiff = item.totalColorDiff / item.count;
                  const hasWarning = avgColorDiff > 5 || Math.abs(item.totalQuantity - item.material.quantity * item.count) > 0.1 * item.count;
                  
                  return (
                    <tr key={item.material.id}>
                      <td className="text-center">{idx + 1}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="me-2">{item.material.code} - {item.material.name}</span>
                          {hasWarning && (
                            <span title="Cần kiểm tra">
                              <AlertTriangle className="text-warning" size={14} />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-center">
                        <span className={`fw-bold ${Math.abs(item.totalQuantity - item.material.quantity * item.count) > 0.1 * item.count ? 'text-warning' : 'text-success'}`}>
                          {item.totalQuantity.toFixed(2)}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="fw-bold">{item.material.unit}</span>
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
                      <td className="text-center">
                        <div className="d-flex justify-content-center align-items-center gap-2">
                          <div className="form-check form-check-inline">
                            <input
                              className="form-check-input"
                              type="radio"
                              name={`status-${idx}`}
                              id={`status-nhap-${idx}`}
                              value={1}
                              checked={statuses[idx] === 1}
                              onChange={() => handleStatusChange(idx, 1)}
                            />
                            <label className="form-check-label" htmlFor={`status-nhap-${idx}`}>Nhập hàng</label>
                          </div>
                          <div className="form-check form-check-inline">
                            <input
                              className="form-check-input"
                              type="radio"
                              name={`status-${idx}`}
                              id={`status-tra-${idx}`}
                              value={0}
                              checked={statuses[idx] === 0}
                              onChange={() => handleStatusChange(idx, 0)}
                            />
                            <label className="form-check-label" htmlFor={`status-tra-${idx}`}>Trả hàng</label>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Đóng</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Đang gửi...' : 'Đồng ý'}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export function SensorCard({ currentSupplier, onPhotoAnalysis, apiOrderItems = [], apiOrders = [], savedItems, weight }: SensorCardProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PhotoAnalysis | null>(null);
  const [currentImage, setCurrentImage] = useState('/images/no_photo.png');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSaveAllModal, setShowSaveAllModal] = useState(false);

  // Convert API order items to RawMaterial format for compatibility
  const convertApiItemToMaterial = (item: ApiOrderItem): RawMaterial & { product_photo?: string } => {
    return {
      id: item.product_id,
      code: item.product_code,
      name: item.product_name,
      unit: item.unit_name,
      quantity: parseFloat(item.quantity),
      diff: parseFloat(item.product_diff_allowed) || 2,
      slug: item.product_code.toLowerCase().replace(/\s+/g, '_'),
      between: `${(parseFloat(item.quantity) * 0.98).toFixed(2)} -> ${(parseFloat(item.quantity) * 1.02).toFixed(2)}`,
      real: parseFloat(item.quantity),
      product_photo: (item.product_photo && !item.product_photo.includes('no_photo.png')) ? item.product_photo : '/images/no_photo.png'
    };
  };

  // Get available materials for dropdown
  const getAvailableMaterials = (): RawMaterial[] => {
    if (apiOrderItems.length > 0) {
      return apiOrderItems.map(convertApiItemToMaterial);
    }
    // Fallback to static data if no API items
    return currentSupplier === 'meat' ? po_meat : po_seafood;
  };

  // Extract main code from Roboflow class (e.g. NVL_THIT0125 from NVL_THIT0125_GIO_HEO_RUT_XUONG)
  const extractMainCode = (className: string): string => {
    const match = className.match(/^(NVL_[A-Z]+\d+)/);
    return match ? match[1] : className;
  };

  // Find material by product code (using main code)
  const findMaterialByCode = (productClass: string): RawMaterial | null => {
    const mainCode = extractMainCode(productClass);
    const materials = getAvailableMaterials();
    return materials.find(material => material.code.startsWith(mainCode)) || null;
  };

  const takePhoto = async () => {
    if (!currentSupplier) {
      (window as any).showToast?.('Vui lòng chọn nhà cung cấp trước khi chụp ảnh.', 'danger');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      let imageToAnalyze: string;
      let isImageLink = false;
      // If no uploaded image, capture from local camera
      if (!uploadedImage) {
        try {
          imageToAnalyze = await captureLocalImage();
          isImageLink = true;
        } catch (err) {
          (window as any).showToast?.('Không thể chụp ảnh từ camera.', 'danger');
          setIsAnalyzing(false);
          return;
        }
      } else {
        imageToAnalyze = uploadedImage;
      }
      
      // Call Roboflow API for prediction
      const prediction = await RoboflowService.predictMaterialFromBase64(imageToAnalyze);
      
      let predictedMaterial: RawMaterial;
      const materials = getAvailableMaterials();
      
      if ('error' in prediction) {
        // If API fails, use random material
        console.warn('Roboflow API error:', prediction.error);
        (window as any).showToast?.('Lỗi AI prediction, sử dụng dự đoán ngẫu nhiên.', 'warning');
        predictedMaterial = materials[numberRandom(0, materials.length - 1)];
      } else {
        // Process AI prediction
        const predictions = prediction.predictions;
        if (predictions && predictions.length > 0) {
          // Get the prediction with highest confidence
          const bestPrediction = predictions.reduce((best, current) => 
            current.confidence > best.confidence ? current : best
          );
          
          // Try to find material by predicted class
          const foundMaterial = findMaterialByCode(bestPrediction.class);
          
          if (foundMaterial) {
            predictedMaterial = foundMaterial;
            (window as any).showToast?.(`AI dự đoán: ${foundMaterial.name} (${bestPrediction.confidence.toFixed(1)}%)`, 'success');
          } else {
            // If predicted class doesn't match any material, use random
            predictedMaterial = materials[numberRandom(0, materials.length - 1)];
            (window as any).showToast?.(`AI dự đoán không khớp, sử dụng: ${predictedMaterial.name}`, 'warning');
          }
        } else {
          // No predictions, use random material
          predictedMaterial = materials[numberRandom(0, materials.length - 1)];
          (window as any).showToast?.('AI không dự đoán được, sử dụng dự đoán ngẫu nhiên.', 'warning');
        }
      }
      
      // --- Call local analysis API for color difference ---
      const url1 = (predictedMaterial as any).product_photo || '/images/no_photo.png';
      let colorDiff = 0;
      let analysisFailed = false;
      let analysisRequest: any = {
        url1,
        product_kind: predictedMaterial.code,
        mode: 'image_link'
      };
      if (isImageLink) {
        analysisRequest.url2 = imageToAnalyze;
      } else if (uploadedImage?.startsWith('data:')) {
        analysisRequest.base2 = uploadedImage.split(',')[1];
      }
      try {
        const analysisResult = await analyzeImage(analysisRequest);
        if (typeof analysisResult.color_difference === 'number') {
          colorDiff = analysisResult.color_difference;
        }
      } catch (err) {
        console.warn('Local analysis API error:', err);
        analysisFailed = true;
        (window as any).showToast?.('Phân tích màu sắc thất bại.', 'warning');
      }
      // --- End local analysis API ---

      // Use live weight if available, else fallback
      let usedWeight = (parseFloat(weight) ? parseFloat(weight) / 1000 : undefined) || (predictedMaterial.quantity + (Math.random() - 0.512) * 0.212);
      // Create analysis result
      const newAnalysis: PhotoAnalysis = {
        predictedMaterial: predictedMaterial,
        quantity: usedWeight,
        colorDiff,
        standardImage: url1,
        capturedImage: imageToAnalyze,
        analysisFailed
      };
      
      setAnalysis(newAnalysis);
      setCurrentImage(newAnalysis.capturedImage);
      
    } catch (error) {
      console.error('Error during photo analysis:', error);
      (window as any).showToast?.('Lỗi trong quá trình phân tích ảnh.', 'danger');
      
      // Fallback to random material
      const materials = getAvailableMaterials();
      const randomMaterial = materials[numberRandom(0, materials.length - 1)];
      
      const newAnalysis: PhotoAnalysis = {
        predictedMaterial: randomMaterial,
        quantity: (parseFloat(weight) ? parseFloat(weight) / 1000 : undefined) || (randomMaterial.quantity + (Math.random() - 0.5) * 0.2),
        colorDiff: Math.random() * 10,
        standardImage: `/images/${currentSupplier}/${randomMaterial.slug}.jpg`,
        capturedImage: uploadedImage || `/images/${currentSupplier}/${randomMaterial.slug}.jpg`
      };
      
      setAnalysis(newAnalysis);
      setCurrentImage(newAnalysis.capturedImage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        (window as any).showToast?.('Vui lòng chọn file ảnh hợp lệ (JPG, PNG, GIF).', 'danger');
        setIsUploading(false);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        (window as any).showToast?.('File ảnh quá lớn. Vui lòng chọn file nhỏ hơn 5MB.', 'danger');
        setIsUploading(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        setCurrentImage(result);
        setIsUploading(false);
        (window as any).showToast?.('Đã tải ảnh thành công.', 'success');
      };
      reader.onerror = () => {
        setIsUploading(false);
        (window as any).showToast?.('Lỗi khi đọc file ảnh.', 'danger');
      };
      reader.readAsDataURL(file);
    }
    
    // Clear the input so the same file can be selected again
    event.target.value = '';
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const clearUploadedImage = () => {
    setUploadedImage(null);
    setCurrentImage('/images/no_photo.png');
    (window as any).showToast?.('Đã xóa ảnh đã tải.', 'info');
  };

  const confirmAnalysis = async () => {
    if (!analysis) 
      return;

    // Find po_id for the selected product_id

    let po_id: number | undefined;
    if (apiOrders && apiOrders.length > 0) {
      for (const order of apiOrders) {
        if (order.po_items.some(item => item.product_id === analysis.predictedMaterial.id)) {
          po_id = order.po_id;
          break;
        }
      }
    }
    if (!po_id) {
      (window as any).showToast?.('Không tìm thấy po_id cho sản phẩm này.', 'danger');
      return;
    }

    // Convert base64 image to Blob
    function dataURLtoBlob(dataurl: string) {
      const arr = dataurl.split(','), match = arr[0].match(/:(.*?);/), mime = match ? match[1] : '', bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
      return new Blob([u8arr], { type: mime });
    }
    let photoFile: File | null = null;
    if (analysis.capturedImage) {
      let dataUrl = analysis.capturedImage;
      if (!dataUrl.startsWith('data:')) {
        // If it's a link, fetch and convert to data URL
        try {
          const response = await fetch(analysis.capturedImage);
          const blob = await response.blob();
          dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (err) {
          (window as any).showToast?.('Không thể tải hình chụp từ link.', 'danger');
          return;
        }
      }
      const blob = dataURLtoBlob(dataUrl);
      photoFile = new File([blob], 'photo.jpg', { type: blob.type });
    } else {
      
      (window as any).showToast?.('Không có hình chụp hợp lệ để upload.', 'danger');
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('po_id', String(po_id));
    formData.append('product_id', String(analysis.predictedMaterial.id));
    formData.append('weight', String(analysis.quantity));
    formData.append('photo', photoFile);
    formData.append('color', String(analysis.colorDiff || 0));
    // Optionally add fat_percentage, meat_percentage if available

    try {
      const apiResult = await saveProductPOResult({
        po_id,
        product_id: analysis.predictedMaterial.id,
        weight: analysis.quantity,
        photo: photoFile,
        color: analysis.colorDiff || 0
        // Add fat_percentage, meat_percentage if available
      });
      const item_id = apiResult?.item?.item_id;
      if (item_id) {
        analysis.item_id = item_id;
      }
      (window as any).showToast?.('Đã lưu thông tin phân tích & gửi lên server.', 'success');
      console.log('formData', formData);
      console.log('po_id', po_id);
      console.log('analysis', analysis);
      onPhotoAnalysis(analysis);
      setAnalysis(null);
      setCurrentImage('/images/no_photo.png');
      setUploadedImage(null);
    } catch (err) {
      (window as any).showToast?.('Lỗi khi gửi dữ liệu lên server.', 'danger');
      console.error(err);
    }
  };

  const selectDifferentMaterial = (material: RawMaterial) => {
    if (analysis) {
      const updatedAnalysis: PhotoAnalysis = {
        ...analysis,
        predictedMaterial: material
      };
      setAnalysis(updatedAnalysis);
    }
  };

  const availableMaterials = getAvailableMaterials();

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex justify-content-between">
          <h5 className="card-title">Ảnh chụp từ sensor</h5>
          <div className="d-flex gap-2">
            <button 
              type="button" 
              className="btn btn-sm btn-outline-secondary" 
              onClick={triggerFileUpload}
              disabled={isUploading}
              title="Tải ảnh lên"
            >
              <Upload className={`me-1 ${isUploading ? 'animate-spin' : ''}`} size={16} />
              {isUploading ? 'Đang tải...' : 'Tải ảnh'}
            </button>
            {uploadedImage && (
              <button 
                type="button" 
                className="btn btn-sm btn-outline-danger" 
                onClick={clearUploadedImage}
                title="Xóa ảnh đã tải"
              >
                <X className="me-1" size={16} />
                Xóa ảnh
              </button>
            )}
            <button 
              type="button" 
              className="btn btn-sm btn-primary" 
              onClick={takePhoto}
              disabled={isAnalyzing || isUploading}
            >
              <Camera className="me-1" size={16} />
              {isAnalyzing ? 'Đang phân tích AI...' : 'Cân & chụp'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="card-body pb-1 pt-0 pe-1 ps-1">
        {!analysis ? (
          <div className="img_photo">
            <img 
              src={currentImage} 
              className="rounded border border-1 w-100" 
              alt="Sensor capture"
            />
            {uploadedImage && (
              <div className="mt-2 text-center">
                <small className="text-success">
                  <i className="fas fa-check-circle me-1"></i>
                  Đã tải ảnh thành công - Sẽ sử dụng ảnh này cho phân tích AI
                </small>
              </div>
            )}
            {!uploadedImage && currentImage === '/images/no_photo.png' && (
              <div className="mt-2 text-center">
                <small className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  Tải ảnh lên hoặc sử dụng ảnh mẫu cho phân tích AI
                </small>
              </div>
            )}
          </div>
        ) : (
          <div className="img_stats">
            <div className="d-flex justify-content-between d-none">
              <h5 className="card-title">Kết quả phân tích AI</h5>
            </div>

            <div className="d-flex justify-content-between">
              <div className="w-50">
                <div className="text-center fw-bold">Hình chuẩn</div>
                <div className="p-2">
                  <img 
                    className="rounded border border-1 w-100 img_1" 
                    src={analysis.standardImage}
                    alt="Standard"
                  />
                </div>
              </div>
              <div className="w-50">
                <div className="text-center fw-bold">Hình chụp</div>
                <div className="p-2">
                  <img 
                    className="rounded border border-1 w-100 img_2" 
                    src={analysis.capturedImage}
                    alt="Captured"
                  />
                </div>
              </div>
            </div>
            
            <div className="d-flex justify-content-between mt-2">
              <div>Dự đoán NVL</div>
              <div className="fw-bold">{analysis.predictedMaterial.name}</div>
            </div>
            <div className="d-flex justify-content-between mt-2">
              <div>Định lượng</div>
              <div className="fw-bold">{analysis.quantity.toFixed(3)} {analysis.predictedMaterial.unit}</div>
            </div>
            <div className="d-flex justify-content-between mt-2">
              <div>Khác biệt màu sắc</div>
              <div className="fw-bold">
                {analysis.analysisFailed ? (
                  <span className="text-danger">Phân tích thất bại</span>
                ) : (
                  `${analysis.colorDiff.toFixed(2)}%`
                )}
              </div>
            </div>
            
            <div className="d-flex justify-content-between mt-2">
              <div className="dropdown">
                <button 
                  type="button" 
                  className="btn btn-sm btn-danger dropdown-toggle" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <Bug className="me-1" size={16} />
                  Chọn lại NVL đúng
                </button>
                <ul className="dropdown-menu">
                  {availableMaterials.map((material) => (
                    <li key={material.slug}>
                      <button 
                        className="dropdown-item" 
                        onClick={() => selectDifferentMaterial(material)}
                      >
                        {material.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                type="button" 
                className="btn btn-sm btn-primary" 
                onClick={confirmAnalysis}
              >
                <Check className="me-1" size={16} />
                Đồng ý & lưu trữ
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="card-footer">
        <div className="d-flex justify-content-between">
          <div></div>
          <button type="button" className="btn btn-sm btn-dark" onClick={() => setShowSaveAllModal(true)}>
            <i className="fas fa-save me-2"></i>
            Hoàn tất quy trình
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
      <SaveAllModal show={showSaveAllModal} onClose={() => setShowSaveAllModal(false)} savedItems={savedItems} apiOrders={apiOrders} />
    </div>
  );
} 