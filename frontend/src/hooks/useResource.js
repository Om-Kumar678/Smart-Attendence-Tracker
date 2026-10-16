import { useCallback, useEffect, useState } from 'react';
import { listResource } from '../services/dataService.js';
import { getErrorMessage } from '../services/api.js';

export default function useResource(resource) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try { setItems(await listResource(resource)); }
    catch (requestError) { setError(getErrorMessage(requestError, `Unable to load ${resource}.`)); }
    finally { setLoading(false); }
  }, [resource]);
  useEffect(() => { refresh(); }, [refresh]);
  return { items, setItems, loading, error, refresh };
}
