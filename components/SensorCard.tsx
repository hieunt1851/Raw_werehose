'use client';

import { useState, useRef } from 'react';
import { Camera, Check, Bug, Upload, X } from 'lucide-react';
import { RawMaterial, PhotoAnalysis, ApiOrderItem } from '@/types';
import { po_meat, po_seafood } from '@/data/materials';
import { numberRandom } from '@/utils/toast';
import { RoboflowService, RoboflowPrediction } from '@/services/roboflow';
import { analyzeImage } from '@/services/api';

interface SensorCardProps {
  currentSupplier: string;
  onPhotoAnalysis: (analysis: PhotoAnalysis) => void;
  apiOrderItems?: ApiOrderItem[];
}

export function SensorCard({ currentSupplier, onPhotoAnalysis, apiOrderItems = [] }: SensorCardProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PhotoAnalysis | null>(null);
  const [currentImage, setCurrentImage] = useState('/images/no_photo.png');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Use the captured image for AI prediction
      const imageToAnalyze = uploadedImage || `/images/${currentSupplier}/sample.jpg`;
      
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
      const base2 = uploadedImage?.startsWith('data:') ? uploadedImage.split(',')[1] : '';
      const product_kind = predictedMaterial.code;
      const mode = 'image_link';
      let colorDiff = 0;
      let analysisFailed = false;
      
      try {
        const analysisResult = await analyzeImage({ url1, base2, product_kind, mode });
        if (typeof analysisResult.color_difference === 'number') {
          colorDiff = analysisResult.color_difference;
        }
      } catch (err) {
        console.warn('Local analysis API error:', err);
        analysisFailed = true;
        (window as any).showToast?.('Phân tích màu sắc thất bại.', 'warning');
      }
      // --- End local analysis API ---

      // Create analysis result
      const newAnalysis: PhotoAnalysis = {
        predictedMaterial: predictedMaterial,
        quantity: predictedMaterial.quantity + (Math.random() - 0.5) * 0.2,
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
        quantity: randomMaterial.quantity + (Math.random() - 0.5) * 0.2,
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

  const confirmAnalysis = () => {
    if (analysis) {
      onPhotoAnalysis(analysis);
      setAnalysis(null);
      setCurrentImage('/images/no_photo.png');
      setUploadedImage(null);
      (window as any).showToast?.('Đã lưu thông tin phân tích.', 'success');
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
      
      <div className="card-body">
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
            <div className="d-flex justify-content-between">
              <h5 className="card-title">Kết quả phân tích AI</h5>
            </div>

            <div className="d-flex justify-content-between mt-2">
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
              <div className="fw-bold">{analysis.quantity.toFixed(2)} {analysis.predictedMaterial.unit}</div>
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
          <button type="button" className="btn btn-dark">
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
    </div>
  );
} 