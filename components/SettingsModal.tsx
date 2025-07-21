import React, { useEffect, useState } from 'react';
import { listSerialPorts, connectSerialPort, subscribeWeightStream, getLocalApiBaseUrl, setLocalApiBaseUrl, getRtspUrl, setRtspUrl } from '@/services/localApi';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weight: string;
  setWeight: (w: string) => void;
}

interface SerialPort {
  port: string;
  description: string;
  manufacturer: string;
  hwid: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, weight, setWeight }) => {
  const [ports, setPorts] = useState<SerialPort[]>([]);
  const [selectedPort, setSelectedPort] = useState('');
  const [baudRate, setBaudRate] = useState(9600);
  const [status, setStatus] = useState('Chưa kết nối');
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [weightStreamUnsub, setWeightStreamUnsub] = useState<(() => void) | null>(null);
  const [localApiUrl, setLocalApiUrl] = useState(() =>
    typeof window !== 'undefined' ? (getLocalApiBaseUrl() || 'http://100.117.1.111:5000') : ''
  );
  const [rtspUrl, setRtspUrlState] = useState(() =>
    typeof window !== 'undefined' ? (getRtspUrl() || 'rtsp://169.254.140.61:554') : ''
  );

  useEffect(() => {
    if (isOpen) {
      listSerialPorts().then(setPorts).catch(() => setPorts([]));
    }
    // Cleanup on close
    return () => {
      if (weightStreamUnsub) weightStreamUnsub();
    };
    // eslint-disable-next-line
  }, [isOpen]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError('');
    setStatus('Đang kết nối...');
    try {
      const res = await connectSerialPort(selectedPort, baudRate);
      setStatus(res.message || 'Đã kết nối');
      // Start weight stream
      if (weightStreamUnsub) weightStreamUnsub();
      const unsub = subscribeWeightStream(
        (w) => {
          setWeight(w);
          console.log('Weight data:', w);
        },
        (err) => setError('Lỗi lấy dữ liệu cân')
      );
      setWeightStreamUnsub(() => unsub);
    } catch (err: any) {
      setError(err.message || 'Kết nối thất bại');
      setStatus('Kết nối thất bại');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleApiUrlSave = () => {
    setLocalApiBaseUrl(localApiUrl);
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast('Đã lưu link API local!', 'success');
    }
  };

  const handleRtspUrlSave = () => {
    setRtspUrl(rtspUrl);
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast('Đã lưu RTSP URL!', 'success');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Cài đặt Serial Port</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {/* RTSP Camera URL setting */}
            <div className="mb-3">
              <label className="form-label">RTSP Camera URL</label>
              <input
                type="text"
                className="form-control"
                value={rtspUrl}
                onChange={e => setRtspUrlState(e.target.value)}
              />
              <button className="btn btn-success mt-2" onClick={handleRtspUrlSave}>
                Lưu RTSP URL
              </button>
            </div>
            {/* Local API URL setting */}
            <div className="mb-3">
              <label className="form-label">Địa chỉ Local API</label>
              <input
                type="text"
                className="form-control"
                value={localApiUrl}
                onChange={e => setLocalApiUrl(e.target.value)}
              />
              <button className="btn btn-success mt-2" onClick={handleApiUrlSave}>
                Lưu địa chỉ API
              </button>
            </div>
            <div className="mb-3">
              <label className="form-label">Chọn cổng Serial</label>
              <select
                className="form-select"
                value={selectedPort}
                onChange={e => setSelectedPort(e.target.value)}
              >
                <option value="">-- Chọn cổng --</option>
                {ports.map(port => (
                  <option key={port.port} value={port.port}>
                    {port.description} ({port.port})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Baud Rate</label>
              <input
                type="number"
                className="form-control"
                value={baudRate}
                onChange={e => setBaudRate(Number(e.target.value))}
              />
            </div>
            <div className="mb-3">
              <button className="btn btn-primary" onClick={handleConnect} disabled={!selectedPort || isConnecting}>
                {isConnecting ? 'Đang kết nối...' : 'Kết nối'}
              </button>
            </div>
            <div className="mb-2">
              <strong>Trạng thái:</strong> {status}
            </div>
            {error && <div className="alert alert-danger py-1">{error}</div>}
            <div className="mb-2">
              <strong>Trọng lượng hiện tại:</strong> <span className="text-success">{weight}</span>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Đóng</button>
          </div>
        </div>
      </div>
    </div>
  );
}; 