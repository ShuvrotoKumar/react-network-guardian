import { NetworkStateManager } from './networkState';

export class SlowRequestDetector {
  private threshold: number;
  private manager?: NetworkStateManager;

  constructor(thresholdMs = 5000, manager?: NetworkStateManager) {
    this.threshold = thresholdMs;
    this.manager = manager;
  }

  async measureRequest<T>(fn: () => Promise<T>): Promise<{ result: T; isSlow: boolean }> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      const isSlow = duration > this.threshold;
      
      if (isSlow && this.manager) {
        this.manager.setStatus('slow');
      }
      
      return { result, isSlow };
    } catch (error) {
      const duration = Date.now() - start;
      const isSlow = duration > this.threshold;
      
      if (isSlow && this.manager) {
        this.manager.setStatus('slow');
      }
      
      throw { error, isSlow };
    }
  }
}
