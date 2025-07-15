import { ToastType } from '@/types';

export function showToast(message: string, type: ToastType = 'success', duration: number = 3000) {
  // Create toast element
  const toast = document.createElement('div');
  const bgClass = {
    success: 'bg-green-500',
    danger: 'bg-red-500',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-blue-500 text-white'
  }[type] || 'bg-gray-500';

  toast.className = `toast align-items-center text-white ${bgClass} border-0 rounded-lg shadow-lg`;
  toast.role = 'alert';
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');

  toast.innerHTML = `
    <div class="d-flex items-center justify-between p-3">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white ms-2" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  // Add to container (create if not exists)
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'fixed bottom-0 right-0 p-3 z-50';
    document.body.appendChild(container);
  }

  container.appendChild(toast);

  // Initialize and show toast
  const bsToast = new (window as any).bootstrap.Toast(toast, { delay: duration });
  bsToast.show();

  // Auto remove after hiding
  toast.addEventListener('hidden.bs.toast', () => {
    toast.remove();
  });
}

export function numberRandom(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
} 