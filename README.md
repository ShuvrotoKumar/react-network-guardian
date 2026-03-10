# React Network Guardian

A React library for managing network status, handling offline scenarios, retrying failed requests, and detecting slow network connections.

## Features

- **Network Status Monitoring**: Real-time tracking of online/offline/slow network states
- **Automatic Retry Logic**: Exponential backoff retry mechanism for failed requests
- **Slow Request Detection**: Identify and handle slow network requests
- **React Hook Integration**: Easy-to-use React hook for seamless integration
- **TypeScript Support**: Full TypeScript support with type definitions

## Installation

```bash
npm install react-network-guardian
```

or

```bash
yarn add react-network-guardian
```

## Usage

### Basic Usage

```tsx
import { useNetworkGuardian } from 'react-network-guardian';

function MyComponent() {
  const { networkStatus, executeWithRetry, measureRequest } = useNetworkGuardian();

  const fetchData = async () => {
    try {
      const data = await executeWithRetry(async () => {
        const response = await fetch('https://api.example.com/data');
        return response.json();
      });
      console.log('Data:', data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const fetchWithMeasurement = async () => {
    try {
      const { data, duration } = await measureRequest(async () => {
        const response = await fetch('https://api.example.com/data');
        return response.json();
      });
      console.log(`Data fetched in ${duration}ms:`, data);
    } catch (error) {
      console.error('Request failed:', error);
    }
  };

  return (
    <div>
      <p>Network Status: {networkStatus}</p>
      <button onClick={fetchData}>Fetch Data (with retry)</button>
      <button onClick={fetchWithMeasurement}>Fetch Data (with measurement)</button>
    </div>
  );
}
```

### Advanced Usage

You can also use the core components directly:

```tsx
import { NetworkStateManager, retryWithBackoff, SlowRequestDetector } from 'react-network-guardian';

const networkManager = new NetworkStateManager();
const slowDetector = new SlowRequestDetector();

// Subscribe to network status changes
const unsubscribe = networkManager.subscribe((status) => {
  console.log('Network status changed:', status);
});

// Use retry logic
const result = await retryWithBackoff(async () => {
  const response = await fetch('https://api.example.com/data');
  if (!response.ok) throw new Error('Request failed');
  return response.json();
});

// Measure request duration
const { data, duration } = await slowDetector.measureRequest(async () => {
  const response = await fetch('https://api.example.com/data');
  return response.json();
});
```

## API Reference

### useNetworkGuardian()

Returns an object with the following properties:

- **networkStatus**: `'online' | 'offline' | 'slow'` - Current network status
- **executeWithRetry**: `<T>(fn: () => Promise<T>) => Promise<T>` - Executes a function with automatic retry logic
- **measureRequest**: `<T>(fn: () => Promise<T>) => Promise<{ data: T; duration: number }>` - Measures request execution time

### NetworkStateManager

A class for managing network state:

- **getStatus()**: Returns current network status
- **setStatus(status)**: Sets network status and notifies listeners
- **subscribe(listener)**: Subscribes to network status changes, returns unsubscribe function

### retryWithBackoff

A function that implements exponential backoff retry logic:

```tsx
const result = await retryWithBackoff(
  async () => {
    // Your async operation
    return await someAsyncOperation();
  },
  {
    maxRetries: 3,        // Maximum number of retries (default: 3)
    baseDelay: 1000,      // Base delay in milliseconds (default: 1000)
    maxDelay: 10000       // Maximum delay in milliseconds (default: 10000)
  }
);
```

### SlowRequestDetector

A class for detecting slow requests:

```tsx
const detector = new SlowRequestDetector();

const { data, duration } = await detector.measureRequest(async () => {
  // Your async operation
  return await someAsyncOperation();
});
```

## Examples

### Handling Offline State

```tsx
function OfflineAwareComponent() {
  const { networkStatus } = useNetworkGuardian();

  if (networkStatus === 'offline') {
    return <div>You're currently offline. Please check your connection.</div>;
  }

  if (networkStatus === 'slow') {
    return <div>Network connection is slow. Some features may be limited.</div>;
  }

  return <div>All systems operational!</div>;
}
```

### Retry Failed API Calls

```tsx
function DataFetcher() {
  const { executeWithRetry } = useNetworkGuardian();

  const loadUserData = async () => {
    try {
      const userData = await executeWithRetry(async () => {
        const response = await fetch('/api/user');
        if (!response.ok) throw new Error('Failed to fetch user data');
        return response.json();
      });
      
      // Use the data
      console.log('User data:', userData);
    } catch (error) {
      console.error('All retry attempts failed:', error);
    }
  };

  return <button onClick={loadUserData}>Load User Data</button>;
}
```

## License

MIT © [ShuvrotoKumar](https://github.com/ShuvrotoKumar)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
