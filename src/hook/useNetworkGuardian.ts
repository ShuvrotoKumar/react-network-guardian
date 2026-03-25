import { useState, useEffect, useContext } from 'react';
import { NetworkStateManager, NetworkStatus } from '../core/networkState';
import { retryWithBackoff } from '../core/retryManager';
import { SlowRequestDetector } from '../core/slowDetector';
import { NetworkGuardianContext } from '../context/NetworkGuardianProvider';

const defaultNetworkManager = new NetworkStateManager();
const defaultSlowDetector = new SlowRequestDetector();

export function useNetworkGuardian() {
  const context = useContext(NetworkGuardianContext);

  // If used within NetworkGuardianProvider, use context values
  if (context) {
    return {
      networkStatus: context.status,
      executeWithRetry: context.executeWithRetry,
      measureRequest: context.measureRequest,
    };
  }

  // Fallback for standalone usage (not recommended, but for backward compatibility)
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(defaultNetworkManager.getStatus());

  useEffect(() => {
    return defaultNetworkManager.subscribe(setNetworkStatus);
  }, []);

  const executeWithRetry = async <T>(fn: () => Promise<T>) => {
    return retryWithBackoff(fn);
  };

  const measureRequest = async <T>(fn: () => Promise<T>) => {
    return defaultSlowDetector.measureRequest(fn);
  };

  return {
    networkStatus,
    executeWithRetry,
    measureRequest,
  };
}
