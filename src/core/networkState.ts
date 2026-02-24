export type NetworkStatus = 'online' | 'offline' | 'slow';

export class NetworkStateManager {
  private status: NetworkStatus = 'online';
  private listeners: Set<(status: NetworkStatus) => void> = new Set();

  getStatus(): NetworkStatus {
    return this.status;
  }

  setStatus(status: NetworkStatus) {
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
