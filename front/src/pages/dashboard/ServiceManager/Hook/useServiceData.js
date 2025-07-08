import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const useServiceData = () => {
  const [services, setServices] = useState([]);
  const [availableFloors, setAvailableFloors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchServices = useCallback(() => {
    setIsLoading(true);
    axios
      .get(`${BASE_URL}/services/`)
      .then((res) => {
        setServices(res.data);
        const floors = [...new Set(res.data.map((service) => service.floor))];
        setAvailableFloors(floors);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching services:", err);
        setError(err);
        setIsLoading(false);
        toast.error("Failed to load services.", { position: "bottom-right" });
      });
  }, []);

  const addService = async (serviceData) => {
    try {
      console.log(serviceData);

      const res = await axios.post(`${BASE_URL}/services/`, serviceData);
      setServices((prevServices) => [...prevServices, res.data]);
      toast.success("سرویس با موفقیت اضافه شد!", { position: "bottom-right" });
      return true;
    } catch (err) {
      console.error("Error adding service:", err);
      toast.error("خطا در ذخیره سرویس!", { position: "bottom-right" });
      return false;
    }
  };

  const updateService = async (id, serviceData) => {
    try {
      const res = await axios.put(`${BASE_URL}/services/${id}/`, serviceData);
      setServices((prevServices) =>
        prevServices.map((s) => (s.id === id ? res.data : s))
      );
      toast.success("سرویس با موفقیت به‌روزرسانی شد!", {
        position: "bottom-right",
      });
      return true;
    } catch (err) {
      console.error("Error updating service:", err);
      toast.error("خطا در به‌روزرسانی سرویس!", { position: "bottom-right" });
      return false;
    }
  };

  const deleteService = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/services/${id}/`);
      setServices((prevServices) => prevServices.filter((s) => s.id !== id));
      toast.success("سرویس با موفقیت حذف شد!", { position: "bottom-right" });
      return true;
    } catch (err) {
      console.error("Error deleting service:", err);
      toast.error("خطا در حذف سرویس!", { position: "bottom-right" });
      return false;
    }
  };

  return {
    services,
    availableFloors,
    isLoading,
    error,
    fetchServices,
    addService,
    updateService,
    deleteService,
  };
};

export default useServiceData;
