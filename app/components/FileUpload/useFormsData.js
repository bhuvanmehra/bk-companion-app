import { useState, useEffect } from 'react';

const useFormsData = () => {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/get-form-data')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setData(data);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching form data:', err);
        setError(err.message || 'Failed to fetch data');
        setLoading(false);
      });
  }, []);

  return { data, isLoading, error };
};

export default useFormsData;
