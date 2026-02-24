export class SlowRequestDetector {
  private threshold: number;

  constructor(thresholdMs = 5000) {
    this.threshold = thresholdMs;
  }

  async measureRequest<T>(fn: () => Promise<T>): Promise<{ result: T; isSlow: boolean }> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      return { result, isSlow: duration > this.threshold };
    } catch (error) {
      const duration = Date.now() - start;
      throw { error, isSlow: duration > this.threshold };
    }
  }
}
