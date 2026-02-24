import { useState, useEffect } from 'react';
import { NetworkStateManager, NetworkStatus } from '../core/networkState';
import { retryWithBackoff } from '../core/retryManager';
import { SlowRequestDetector } from '../core/slowDetector';

const networkManager = new NetworkStateManager();
const slowDetector = new SlowRequestDetector();

export function useNetworkGuardian() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(networkManager.getStatus());

  useEffect(() => {
    return networkManager.subscribe(setNetworkStatus);
  }, []);

  const executeWithRetry = async <T>(fn: () => Promise<T>) => {
    return retryWithBackoff(fn);
  };

  const measureRequest = async <T>(fn: () => Promise<T>) => {
    return slowDetector.measureRequest(fn);
  };

  return {
    networkStatus,
    executeWithRetry,
    measureRequest,
  };
}
