
"use client";

import { useState, useEffect, useCallback } from 'react';

// A custom hook to synchronize state with the browser's localStorage.
// This hook is "hydration-safe", meaning it won't cause mismatches between
// the server-rendered and client-rendered HTML, which is a common issue in Next.js.
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void, () => void] {
  
  // The 'readValue' function is memoized to prevent re-creation on every render.
  // It safely reads a value from localStorage, handling potential errors and the
  // server-side case where 'window' is not defined.
  const readValue = useCallback((): T => {
    // On the server, 'window' is not available, so we return the initial value.
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      // Parse the stored JSON, or return the initial value if nothing is stored.
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // 'storedValue' holds the current state. It starts with the initial value.
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // The 'setValue' function updates the state and persists it to localStorage.
  const setValue = (value: T) => {
    // Warn if trying to use localStorage on the server.
    if (typeof window == 'undefined') {
      console.warn(
        `Tried setting localStorage key “${key}” even though environment is not a client`
      );
    }
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Update the React state.
      setStoredValue(valueToStore);
      // Persist the new value to localStorage.
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  // The 'clearValue' function removes the item from localStorage and resets the state.
  const clearValue = () => {
    try {
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue);
        }
    } catch (error) {
        console.error(error);
    }
  }
  
  // This 'useEffect' hook runs once when the component mounts on the client.
  // It reads the initial value from localStorage and updates the state.
  // This is the key to being "hydration-safe". The server renders with 'initialValue',
  // and the client also renders with 'initialValue' initially. Then, this effect
  // runs and updates the state to the value from localStorage, triggering a re-render
  // only on the client.
  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [storedValue, setValue, clearValue];
}

export default useLocalStorage;
