export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  backoffFactor?: number;
  retryOn?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any, nextDelay: number) => void;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    backoffFactor = 2,
    retryOn = () => true,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts || !retryOn(lastError)) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(backoffFactor, attempt - 1);
      
      if (onRetry) {
        onRetry(attempt, lastError, delay);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Specialized retry for API calls (fetch/axios)
 * Retries on 5xx status codes, 429 (Too Many Requests), and network errors by default.
 */
export async function autoRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const defaultRetryOn = (error: any) => {
    // If it's a fetch Response object or has a status property
    if (error && typeof error.status === 'number') {
      return error.status >= 500 || error.status === 429;
    }
    // Network errors (no status but is an instance of Error)
    return true;
  };

  return retryWithBackoff(fn, {
    retryOn: defaultRetryOn,
    ...options
  });
}
