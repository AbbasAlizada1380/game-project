import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Plus } from "lucide-react"; // Removed X as it wasn't used in the snippet for modal closing
import { useSelector } from "react-redux";
import ServiceTable from "../ServiceManager/ServiceTable";
import CustomerDetailsModal from "../ServiceManager/CustomerDetailsModal";
import FilterServices from "../ServiceManager/FilterServices";
import useServiceData from "../ServiceManager/Hook/useServiceData";
import useCustomerData from "../ServiceManager/Hook/useCustomerData";
import { shamsiMonths } from "../../../utils/dateConvert"; // Make sure this path is correct
import ServiceForm from "../ServiceManager/ServiceForm";

export default function ServiceManager() {
  const role = useSelector((state) => state.user.currentUser.role[0])
  const [newService, setNewService] = useState({
    floor: 0,
    year: "",
    time: "", // This seems to store the month number for new/editing service
  });

  const [editingService, setEditingService] = useState(null);
  // selectedFloor, selectedYear, selectedMonth are for the ServiceForm, not for filtering the table
  const [selectedFloorForForm, setSelectedFloorForForm] = useState(null); // Renamed for clarity if it's for form
  const [selectedYearForForm, setSelectedYearForForm] = useState(""); // Renamed for clarity
  const [selectedMonthForForm, setSelectedMonthForForm] = useState(""); // Renamed for clarity (stores month name)

  const [isDetailFormOpen, setIsDetailFormOpen] = useState(true); // Its usage seems tied to re-fetching services
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerServiceDetails, setCustomerServiceDetails] = useState(null);
  const [showServiceForm, setShowServiceForm] = useState(false);

  // --- MODIFIED: State for month range filtering ---
  const [filterYear, setFilterYear] = useState("");
  const [filterStartMonth, setFilterStartMonth] = useState(""); // Stores the START Month NAME
  const [filterEndMonth, setFilterEndMonth] = useState(""); // Stores the END Month NAME
  // const [filterMonth, setFilterMonth] = useState(""); // OLD: This line is replaced
  const [filterFloor, setFilterFloor] = useState("");

  const startYear = 1400;
  const endYear = 1430;
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );

  const {
    services,
    isLoading,
    error,
    fetchServices,
    addService,
    updateService,
    deleteService,
  } = useServiceData();

  // Assuming selectedFloor in useCustomerData refers to the form's floor or a detail view, not the table filter
  const { customersList, customersInfo } = useCustomerData(
    services,
    selectedFloorForForm // Use the renamed state if it's form-specific
  );

  const [selectedServiceYear, setSelectedServiceYear] = useState(""); // For CustomerDetailsModal
  const [selectedServiceTime, setSelectedServiceTime] = useState(""); // For CustomerDetailsModal (month number)

  // Handlers for the ServiceForm
  const handleYearSelectForForm = (e) => {
    setSelectedYearForForm(e.target.value);
  };

  const handleMonthSelectForForm = (e) => {
    setSelectedMonthForForm(e.target.value);
  };

  const closeModal = () => {
    setCustomerServiceDetails(null);
  };

  const handleOpenModal = () => {
    setShowServiceForm(true);
    // Reset form fields when opening for a new service
    setNewService({ floor: 0, year: "", time: "" });
    setSelectedYearForForm("");
    setSelectedMonthForForm("");
    setEditingService(null);
  };

  const saveService = async () => {
    if (!newService.floor || !selectedYearForForm || !selectedMonthForForm) {
      // Check form floor too
      toast.error("لطفا طبقه, سال و ماه را برای سرویس وارد کنید!", {
        position: "top-left",
      });
      return;
    }

    const monthNumber = shamsiMonths.indexOf(selectedMonthForForm) + 1;
    if (monthNumber === 0) {
      // month not found in shamsiMonths
      toast.error("ماه انتخاب شده نامعتبر است.", { position: "top-left" });
      return;
    }

    const serviceData = {
      floor: newService.floor, // Ensure this is set, e.g., from newService.floor
      year: selectedYearForForm,
      month: monthNumber, // Backend expects 'month'
      time: String(monthNumber), // 'time' also seems to be month number in your data
      is_approved: newService.is_approved || false, // Default to false if not set
      customers_list: editingService ? editingService.customers_list : {}, // Preserve or initialize customers_list
    };

    const success = editingService
      ? await updateService(editingService.id, serviceData)
      : await addService(serviceData);

    if (success) {
      resetForm();
      // fetchServices(); // fetchServices is called by useEffect on isDetailFormOpen change
      setIsDetailFormOpen((prev) => !prev); // Trigger re-fetch
    }
  };

  const removeService = async (id) => {
    const success = await deleteService(id);
    if (success) {
      // fetchServices();
      setIsDetailFormOpen((prev) => !prev); // Trigger re-fetch
    }
  };

  const editService = useCallback(
    (service) => {
      // service.month is a number (1-12), service.time is also a number string
      const monthIndex = parseInt(service.month || service.time) - 1; // Use service.month primarily

      setNewService({
        floor: service.floor,
        // year and time for `newService` state are less critical if `selectedYearForForm` and `selectedMonthForForm` drive the form
        year: service.year,
        time: String(service.month || service.time), // Store month number
        is_approved: service.is_approved,
      });
      setSelectedYearForForm(String(service.year));
      setSelectedMonthForForm(shamsiMonths[monthIndex] || ""); // Set month name for the form
      setSelectedFloorForForm(service.floor); // Set floor for the form if needed
      setEditingService(service);
      setShowServiceForm(true);
    },
    [shamsiMonths] // shamsiMonths is a dependency
  );

  const resetForm = useCallback(() => {
    setNewService({
      floor: 0,
      year: "",
      time: "",
      is_approved: false,
    });
    setSelectedYearForForm("");
    setSelectedMonthForForm("");
    setSelectedFloorForForm(null);
    setEditingService(null);
    setShowServiceForm(false);
  }, []);

  useEffect(() => {
    const fetchCustomerServiceDetails = async () => {
      if (selectedCustomer) {
        const customerData = customersList[selectedCustomer];
        if (customerData) {
          setCustomerServiceDetails(customerData);
          let serviceFound = null;
          for (const service of services) {
            if (
              service.customers_list &&
              service.customers_list[selectedCustomer]
            ) {
              serviceFound = service;
              break;
            }
          }
          if (serviceFound) {
            setSelectedServiceYear(serviceFound.year);
            setSelectedServiceTime(
              String(serviceFound.month || serviceFound.time)
            ); // Use month number for modal
          } else {
            setSelectedServiceYear("");
            setSelectedServiceTime("");
          }
        } else {
          setCustomerServiceDetails(null);
        }
      } else {
        setCustomerServiceDetails(null);
        setSelectedServiceYear("");
        setSelectedServiceTime("");
      }
    };
    fetchCustomerServiceDetails();
  }, [selectedCustomer, customersList, services]);

  useEffect(() => {
    fetchServices();
    // console.log(isDetailFormOpen); // Keep for debugging if needed
    // setIsDetailFormOpen(true); // This line might cause infinite loops if not careful.
    // The intention is likely to refetch when modal closes.
    // It's better to trigger refetch explicitly, e.g. after save/delete.
  }, [isDetailFormOpen, fetchServices]); // Added fetchServices as dependency

  const filteredServices = useMemo(() => {
    let filtered = [...services];

    if (filterYear) {
      filtered = filtered.filter(
        (service) => String(service.year) === String(filterYear)
      );
    }

    // --- MODIFIED: Month Range Filtering Logic ---
    // service.month is assumed to be a number (1-12)
    // service.time also seems to be a month number string in your data structure
    if (filterStartMonth && filterEndMonth) {
      const startMonthIndex = shamsiMonths.indexOf(filterStartMonth);
      const endMonthIndex = shamsiMonths.indexOf(filterEndMonth);

      if (startMonthIndex !== -1 && endMonthIndex !== -1) {
        const startMonthNumber = startMonthIndex + 1;
        const endMonthNumber = endMonthIndex + 1;

        if (startMonthNumber <= endMonthNumber) {
          filtered = filtered.filter((service) => {
            const serviceMonthNumber = parseInt(
              service.month || service.time,
              10
            );
            return (
              serviceMonthNumber >= startMonthNumber &&
              serviceMonthNumber <= endMonthNumber
            );
          });
        }
        // Optional: Handle cases where startMonthNumber > endMonthNumber (e.g., show warning or don't filter)
      }
    } else if (filterStartMonth) {
      const startMonthIndex = shamsiMonths.indexOf(filterStartMonth);
      if (startMonthIndex !== -1) {
        const startMonthNumber = startMonthIndex + 1;
        filtered = filtered.filter(
          (service) =>
            parseInt(service.month || service.time, 10) === startMonthNumber
        );
      }
    } else if (filterEndMonth) {
      const endMonthIndex = shamsiMonths.indexOf(filterEndMonth);
      if (endMonthIndex !== -1) {
        const endMonthNumber = endMonthIndex + 1;
        filtered = filtered.filter(
          (service) =>
            parseInt(service.month || service.time, 10) === endMonthNumber
        );
      }
    }
    // --- END OF MODIFIED Month Filtering Logic ---

    if (filterFloor) {
      filtered = filtered.filter((service) => {
        return String(service.floor) === String(filterFloor);
      });
    }

    return filtered;
  }, [
    services,
    filterYear,
    filterStartMonth,
    filterEndMonth,
    filterFloor,
    shamsiMonths,
  ]); // --- MODIFIED: Added filterStartMonth, filterEndMonth dependencies

  // Effect to reset page when filters change (Optional but good practice)
  // This wasn't in your original ServiceManager, but was in Rent. Add if you want pagination reset on filter.
  /*
  const [currentPage, setCurrentPage] = useState(1); // If you add pagination to ServiceTable
  useEffect(() => {
    setCurrentPage(1);
  }, [filterYear, filterStartMonth, filterEndMonth, filterFloor]);
  */

  return (
    <div className="p-6 flex gap-6 relative">
      <ToastContainer
        position="top-left"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        limit={3}
      />
      <div className="flex-1">
        <h2 className="text-xl font-bold mb-4 text-center">مدیریت سرویس‌ها</h2>
        {!showServiceForm && (
          <div className="my-5 flex justify-center">
            <button
              onClick={handleOpenModal}
              className={`${
                role == 3 ? "hidden" : ""
              } bg-green-500 hover:bg-green-700 cursor-pointer text-white font-bold py-2 px-4 rounded flex items-center gap-2`}
            >
              <Plus className="w-4 h-4" />
              افزودن سرویس
            </button>
          </div>
        )}

        {showServiceForm && (
          <ServiceForm
            newService={newService}
            setNewService={setNewService}
            selectedYear={selectedYearForForm} // Use renamed state
            selectedMonth={selectedMonthForForm} // Use renamed state
            onYearSelect={handleYearSelectForForm} // Use renamed handler
            onMonthSelect={handleMonthSelectForForm} // Use renamed handler
            saveService={saveService}
            years={years}
            shamsiMonths={shamsiMonths}
            editingService={editingService}
            setShowServiceForm={setShowServiceForm}
            // Pass floor state for form if ServiceForm handles it
            // selectedFloorForForm={selectedFloorForForm}
            // setSelectedFloorForForm={setSelectedFloorForForm}
          />
        )}

        <FilterServices
          filterYear={filterYear}
          setFilterYear={setFilterYear}
          // --- MODIFIED: Pass new month filter props ---
          filterStartMonth={filterStartMonth}
          setFilterStartMonth={setFilterStartMonth}
          filterEndMonth={filterEndMonth}
          setFilterEndMonth={setFilterEndMonth}
          // filterMonth={filterMonth} // OLD: This prop is removed
          // setFilterMonth={setFilterMonth} // OLD: This prop is removed
          filterFloor={filterFloor}
          setFilterFloor={setFilterFloor}
          years={years}
          shamsiMonths={shamsiMonths} // Pass shamsiMonths here
        />

        {isLoading && <p className="text-center">در حال بارگیری خدمات...</p>}
        {error && (
          <p className="text-center text-red-500">خطا: {error.message}</p>
        )}

        {filteredServices.length === 0 && !isLoading && (
          <p className="text-center">
            {services.length === 0 &&
            !filterYear &&
            !filterStartMonth &&
            !filterEndMonth &&
            !filterFloor
              ? "هیچ سرویسی برای نمایش وجود ندارد."
              : "هیچ سرویسی با فیلترهای انتخابی یافت نشد."}
          </p>
        )}
        {filteredServices.length > 0 && (
          <ServiceTable
            setIsDetailFormOpen={setIsDetailFormOpen}
            services={filteredServices} // Pass filtered services
            fetchServices={fetchServices} // Or trigger refetch via setIsDetailFormOpen
            editService={editService}
            removeService={removeService}
          />
        )}
      </div>
      {customerServiceDetails && (
        <CustomerDetailsModal
          onClose={closeModal}
          customerServiceDetails={customerServiceDetails}
          customersInfo={customersInfo}
          selectedCustomer={selectedCustomer}
          selectedServiceYear={selectedServiceYear}
          selectedServiceTime={selectedServiceTime} // This is month number
        />
      )}
    </div>
  );
}
