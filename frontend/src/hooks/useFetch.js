import { useState, useEffect } from 'react';
import axios from 'axios';

export function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!!url); // True if URL exists, false if null
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return; // Skip if no URL
    
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(url);
        if (isMounted) setData(response.data);
      } catch (err) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [url]);

  return { data, loading, error };
}