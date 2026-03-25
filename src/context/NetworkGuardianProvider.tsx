import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { NetworkStatus, NetworkStateManager } from '../core/networkState';
import { retryWithBackoff, RetryOptions } from '../core/retryManager';
import { SlowRequestDetector } from '../core/slowDetector';

export interface NetworkGuardianContextType {
  status: NetworkStatus;
  executeWithRetry: <T>(fn: () => Promise<T>, options?: RetryOptions) => Promise<T>;
  measureRequest: <T>(fn: () => Promise<T>) => Promise<{ result: T; isSlow: boolean }>;
}

export const NetworkGuardianContext = createContext<NetworkGuardianContextType | undefined>(undefined);

interface NetworkGuardianProviderProps {
  children: ReactNode;
  thresholdMs?: number;
}

export function NetworkGuardianProvider({ 
  children, 
  thresholdMs = 5000 
}: NetworkGuardianProviderProps) {
  const [networkManager] = useState(() => new NetworkStateManager());
  const [slowDetector] = useState(() => new SlowRequestDetector(thresholdMs, networkManager));
  const [status, setStatus] = useState<NetworkStatus>(networkManager.getStatus());

  useEffect(() => {
    const unsubscribe = networkManager.subscribe(setStatus);
    return () => unsubscribe();
  }, [networkManager]);

  const value = useMemo<NetworkGuardianContextType>(() => ({
    status,
    executeWithRetry: function<T>(fn: () => Promise<T>, options?: RetryOptions) {
      return retryWithBackoff(fn, options);
    },
    measureRequest: function<T>(fn: () => Promise<T>) {
      return slowDetector.measureRequest(fn);
    }
  }), [status, networkManager, slowDetector]);

  return (
    <NetworkGuardianContext value={value}>
      {children}
    </NetworkGuardianContext>
  );
}
