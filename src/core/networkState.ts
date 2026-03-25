export type NetworkStatus = 'online' | 'offline' | 'slow';

export class NetworkStateManager {
  private status: NetworkStatus = 'online';
  private listeners: Set<(status: NetworkStatus) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && window.addEventListener) {
      this.status = navigator.onLine ? 'online' : 'offline';
      
      window.addEventListener('online', () => this.setStatus('online'));
      window.addEventListener('offline', () => this.setStatus('offline'));
      
      // Optional: use Network Information API if available
      if ('connection' in navigator) {
        (navigator as any).connection.addEventListener('change', () => {
          this.checkConnectionQuality();
        });
      }
    }
  }

  private checkConnectionQuality() {
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn.saveData) {
        this.setStatus('slow');
      } else if (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g') {
        this.setStatus('slow');
      } else if (this.status === 'slow') {
        this.setStatus('online');
      }
    }
  }

  getStatus(): NetworkStatus {
    return this.status;
  }

  setStatus(status: NetworkStatus) {
    if (this.status === status) return;
    this.status = status;
    this.notifyListeners();
  }

  subscribe(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.status));
  }
}
