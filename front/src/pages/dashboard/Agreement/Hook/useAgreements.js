// Path: src/components/Agreement/Hook/useAgreements.js (Adjust path as needed)
import { useState, useEffect, useCallback } from "react";
import api from "../../../../utils/api"; // Adjust path as needed
import { toast } from "react-toastify";

const useAgreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // General loading for fetch
  const [isMutating, setIsMutating] = useState(false); // Separate state for create/update/delete
  const [error, setError] = useState(null); // Error from initial fetch

  const fetchAgreements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getAgreements();
      setAgreements(response.data);
    } catch (err) {
      setError(err);
      // Avoid toasting fetch errors directly in hook, let component decide how to display persistent fetch errors
      console.error("Error fetching agreements:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgreements();
  }, [fetchAgreements]);

  const createAgreement = async (data) => {
    setIsMutating(true);
    let success = false;
    try {
      await api.createAgreement(data);
      toast.success("قرارداد موفقانه اضافه شد!");
      await fetchAgreements(); // Refetch data
      success = true;
    } catch (err) {
      // More specific error toast
      const errorMsg =
        err.response?.data?.detail ||
        (typeof err.response?.data === "object"
          ? JSON.stringify(err.response.data)
          : null) ||
        "خطا در افزودن قرارداد.";
      toast.error(errorMsg);
      console.error("Error creating agreement:", err);
      success = false;
    } finally {
      setIsMutating(false);
    }
    return success; // Return status
  };

  const updateAgreement = async (id, data) => {
    setIsMutating(true);
    let success = false;
    try {
      await api.updateAgreement(id, data);
      toast.success("قرارداد موفقانه ویرایش شد!");
      await fetchAgreements();
      success = true;
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        (typeof err.response?.data === "object"
          ? JSON.stringify(err.response.data)
          : null) ||
        "خطا در ویرایش قرارداد.";
      toast.error(errorMsg);
      console.error("Error updating agreement:", err);
      success = false;
    } finally {
      setIsMutating(false);
    }
    return success;
  };

  const deleteAgreement = async (id) => {
    setIsMutating(true);
    let success = false;
    try {
      await api.deleteAgreement(id);
      toast.success("قرارداد موفقانه حذف شد!");
      await fetchAgreements();
      success = true;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "خطا در حذف قرارداد.";
      toast.error(errorMsg);
      console.error("Error deleting agreement:", err);
      success = false;
    } finally {
      setIsMutating(false);
    }
    return success;
  };

  return {
    agreements,
    isLoading, // For initial load / refetch
    isMutating, // For create/update/delete operations
    error, // Primarily for fetch errors now
    fetchAgreements, // Expose fetch if needed
    createAgreement,
    updateAgreement,
    deleteAgreement,
  };
};

export default useAgreements;
