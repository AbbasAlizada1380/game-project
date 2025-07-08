// Path: src/components/Agreement/Hook/useCustomers.js (Adjust path as needed)
import { useState, useEffect, useCallback } from "react";
import api from "../../../../utils/api"; // Adjust path as needed
// Removed toast import here, fetch errors handled by component

const useCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null); 
    try {
      const response = await api.getCustomers();
      setCustomers(response.data);
    } catch (err) {
      setError(err); // Set error state for component to handle
      console.error("Error fetching customers:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    isLoading,
    error,
    fetchCustomers,
  };
};

export default useCustomers;
