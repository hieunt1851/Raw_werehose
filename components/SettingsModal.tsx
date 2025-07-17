import React, { useEffect, useState } from 'react';
import { listSerialPorts, connectSerialPort, subscribeWeightStream } from '@/services/localApi';

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