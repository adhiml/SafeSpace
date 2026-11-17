import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Loads data every time the screen gains focus.
 * `load` must be a stable reference (e.g. a module-level service function).
 * If a refresh fails after data has loaded, the last good data is kept and `error` is set.
 */
export function useInsightsData<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState(false);

  const reload = useCallback(async () => {
    try {
      setError(false);
      setData(await load());
    } catch {
      setError(true);
    }
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return { data, error, reload };
}
