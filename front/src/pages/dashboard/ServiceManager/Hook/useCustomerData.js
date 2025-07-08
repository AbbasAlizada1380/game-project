import { useState, useEffect, useCallback } from "react";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const useCustomerData = (services, selectedFloor) => {
  const [customersList, setCustomersList] = useState({});
  const [customersInfo, setCustomersInfo] = useState({});
  const [floorCustomers, setFloorCustomers] = useState([]);
  const [fetchCustomerInfo, setFetchCustomerInfo] = useState(
    () => async (customerId) => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/customers/${customerId}/`
        );
        return response.data;
      } catch (error) {
        console.error(
          `Error fetching customer info for customer ID ${customerId}:`,
          error
        );
        return null;
      }
    }
  );

  const updateCustomerList = useCallback(() => {
    let allCustomerIds = new Set();
    let allCustomersData = {};

    const servicesToProcess = selectedFloor
      ? services.filter((service) => service.floor === selectedFloor)
      : services;

    servicesToProcess.forEach((service) => {
      if (service.customers_list) {
        for (const customerId in service.customers_list) {
          allCustomerIds.add(customerId);
          allCustomersData[customerId] = service.customers_list[customerId];
        }
      }
    });

    const uniqueCustomerIds = Array.from(allCustomerIds);
    setFloorCustomers(uniqueCustomerIds);
    setCustomersList(allCustomersData);
  }, [services, selectedFloor]);

  useEffect(() => {
    updateCustomerList();
  }, [updateCustomerList]);

  useEffect(() => {
    const getCustomerInfoList = async () => {
      const info = {};
      for (const customerId of floorCustomers) {
        const customerInfo = await fetchCustomerInfo(customerId);
        if (customerInfo) {
          info[customerId] = customerInfo;
        }
      }
      setCustomersInfo(info);
    };

    if (floorCustomers.length > 0) {
      getCustomerInfoList();
    } else {
      setCustomersInfo({});
    }
  }, [floorCustomers, fetchCustomerInfo]);

  return {
    customersList,
    customersInfo,
    floorCustomers,
    setFetchCustomerInfo,
  };
};

export default useCustomerData;
