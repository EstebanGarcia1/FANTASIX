import { useState, useEffect } from 'react';

/**
 * Hook para aplicar debounce a un valor
 * @param value - Valor a debounce
 * @param delay - Delay en millisegundos (default: 300)
 * @returns Valor con debounce aplicado
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}