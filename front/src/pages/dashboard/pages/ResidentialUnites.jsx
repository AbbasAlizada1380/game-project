// src/components/UnitManager.jsx  (or wherever you place your components)

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaRegEdit, FaSearch } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import {
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiX,
  FiChevronDown,
} from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment-jalaali"; // Use moment-jalaali

// Configure moment-jalaali
moment.loadPersian({ usePersianDigits: true, dialect: "persian-modern" });

// --- Define Status Options for Units ---
const statusOptions = [
  { value: "Occupied", label: "اشغال شده" },
  { value: "Vacant", label: "خالی" },
  { value: "Maintenance", label: "تحت ترمیم" },
];

// --- Configure API Base URL and Endpoint ---
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";
const API_URL = `${BASE_URL}/units/`; // Correct endpoint for units
const itemsPerPage = 15;

const UnitManager = () => {
  // --- State Management (Adapted from StaffManager) ---
  const [unitData, setUnitData] = useState({
    unit_number: "",
    customer_name: "",
    customer_father_name: "",
    services_description: "",
    service_charge: "",
    current_water_reading: "",
    current_electricity_reading: "",
    status: "", // Default status handled by backend, but can be set here
  });
  // No photo state needed for units
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [unitList, setUnitList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUnitList, setFilteredUnitList] = useState([]);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- Fetch Initial Data ---
  useEffect(() => {
    fetchUnits();
  }, []);

  // --- Filter List on Search/Data Change ---
  useEffect(() => {
    filterUnitList(searchTerm);
    setCurrentPage(1); // Reset page on filter change
  }, [unitList, searchTerm]);

  // --- Fetch Units Data ---
  const fetchUnits = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL);
      setUnitList(response.data || []); // Assuming API returns an array
    } catch (error) {
      console.error("Error fetching unit data:", error);
      toast.error("خطا در دریافت اطلاعات واحدها!");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Filter Units Logic ---
  const filterUnitList = (term) => {
    const lowerSearchTerm = term.toLowerCase().trim();
    if (!lowerSearchTerm) {
      setFilteredUnitList(unitList);
      return;
    }
    const filtered = unitList.filter((unit) => {
      const statusLabel =
        statusOptions.find((s) => s.value === unit.status)?.label || "";
      return (
        unit.unit_number?.toLowerCase().includes(lowerSearchTerm) ||
        unit.customer_name?.toLowerCase().includes(lowerSearchTerm) ||
        unit.customer_father_name?.toLowerCase().includes(lowerSearchTerm) ||
        unit.status?.toLowerCase().includes(lowerSearchTerm) ||
        statusLabel.toLowerCase().includes(lowerSearchTerm) ||
        String(unit.service_charge).includes(lowerSearchTerm) // Allow searching by charge
      );
    });
    setFilteredUnitList(filtered);
  };

  // --- Handle Form Input Change ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUnitData({ ...unitData, [name]: value });
  };

  // --- Handle Form Submission (Create/Update) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Prepare data - No FormData needed as no file upload
    const dataToSend = {};
    Object.keys(unitData).forEach((key) => {
      // Include empty strings if necessary for backend validation, otherwise filter null/undefined
      if (unitData[key] !== null && unitData[key] !== undefined) {
        dataToSend[key] = unitData[key];
      }
    });
    // Ensure numeric fields are numbers if required by backend, else send as string
    if (dataToSend.service_charge)
      dataToSend.service_charge = parseFloat(dataToSend.service_charge) || 0;
    if (dataToSend.current_water_reading)
      dataToSend.current_water_reading =
        parseFloat(dataToSend.current_water_reading) || 0;
    if (dataToSend.current_electricity_reading)
      dataToSend.current_electricity_reading =
        parseFloat(dataToSend.current_electricity_reading) || 0;

    const url = editingId ? `${API_URL}${editingId}/` : API_URL;
    const method = editingId ? "patch" : "post"; // Use PATCH for partial updates

    try {
      await axios({
        method,
        url,
        data: dataToSend, // Send as JSON
        headers: { "Content-Type": "application/json" }, // Set content type
      });
      await fetchUnits(); // Refetch data after successful save
      toast.success(`واحد با موفقیت ${editingId ? "بروزرسانی" : "ثبت"} شد.`);
      resetForm();
      setIsFormVisible(false);
    } catch (error) {
      console.error(
        "Error saving unit:",
        error.response?.data || error.message
      );
      let errorMsg = `خطا در ${editingId ? "بروزرسانی" : "ثبت"} واحد.`;
      if (error.response && error.response.data) {
        const errors = error.response.data;
        // Enhanced error display from backend validation
        if (typeof errors === "object") {
          const messages = Object.entries(errors)
            .map(([key, value]) => {
              const fieldLabels = {
                unit_number: "نمبر واحد",
                customer_name: "نام ساکن",
                customer_father_name: "نام پدر ساکن",
                service_charge: "شارژ خدماتی",
                status: "وضعیت",
              };
              const label = fieldLabels[key] || key;
              return `${label}: ${
                Array.isArray(value) ? value.join(", ") : value
              }`;
            })
            .join(" | ");
          if (messages) errorMsg += ` (${messages})`;
        } else if (typeof errors === "string") {
          errorMsg += ` (${errors})`;
        } else if (errors.detail) {
          errorMsg += ` (${errors.detail})`;
        }
      }
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setUnitData({
      unit_number: "",
      customer_name: "",
      customer_father_name: "",
      services_description: "",
      service_charge: "",
      current_water_reading: "",
      current_electricity_reading: "",
      status: "",
    });
    setEditingId(null);
    setIsStatusDropdownOpen(false);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "آیا از حذف این واحد مطمئن هستید؟",
      text: "این عمل قابل بازگشت نیست!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "حذف",
      cancelButtonText: "انصراف",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        try {
          await axios.delete(`${API_URL}${id}/`);
          await fetchUnits(); // Refetch units after delete
          toast.success("واحد با موفقیت حذف شد.");
          if (
            currentPage > 1 &&
            currentUnits.length === 1 &&
            filteredUnitList.length > 1
          ) {
            handlePageChange(currentPage - 1); // Go back a page if last item on page deleted
          }
        } catch (error) {
          console.error("Error deleting unit:", error);
          toast.error("در هنگام حذف واحد خطایی رخ داد.");
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleEdit = (unit) => {
    setEditingId(unit.id);
    setUnitData({
      unit_number: unit.unit_number || "",
      customer_name: unit.customer_name || "",
      customer_father_name: unit.customer_father_name || "",
      services_description: unit.services_description || "",
      service_charge: unit.service_charge || "",
      current_water_reading:
        unit.current_water_reading !== null ? unit.current_water_reading : "",
      current_electricity_reading:
        unit.current_electricity_reading !== null
          ? unit.current_electricity_reading
          : "",
      status: unit.status || "",
    });
    setIsFormVisible(true);
    setIsStatusDropdownOpen(false); // Close dropdown when opening form
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= pageCount) {
      setCurrentPage(pageNumber);
    }
  };

  const pageCount = Math.ceil(filteredUnitList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUnits = filteredUnitList.slice(startIndex, endIndex); // Use filtered list

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // Max buttons to show
    let startPage = 1;
    let endPage = pageCount;

    if (pageCount > maxVisiblePages) {
      const half = Math.floor(maxVisiblePages / 2);
      startPage = Math.max(currentPage - half, 1);
      endPage = startPage + maxVisiblePages - 1;
      if (endPage > pageCount) {
        endPage = pageCount;
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }

    if (startPage > 1) {
      pageNumbers.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`px-3 py-1 rounded-lg mx-1 text-sm ${
            currentPage === 1
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
          disabled={isLoading}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pageNumbers.push(
          <span key="start-ellipsis" className="px-1 text-gray-500">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-lg mx-1 text-sm ${
            currentPage === i
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
          disabled={isLoading}
        >
          {i}
        </button>
      );
    }

    if (endPage < pageCount) {
      if (endPage < pageCount - 1) {
        pageNumbers.push(
          <span key="end-ellipsis" className="px-1 text-gray-500">
            ...
          </span>
        );
      }
      pageNumbers.push(
        <button
          key={pageCount}
          onClick={() => handlePageChange(pageCount)}
          className={`px-3 py-1 rounded-lg mx-1 text-sm ${
            currentPage === pageCount
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
          disabled={isLoading}
        >
          {pageCount}
        </button>
      );
    }

    return pageNumbers;
  };

  const toggleStatusDropdown = () => {
    setIsStatusDropdownOpen(!isStatusDropdownOpen);
  };

  const handleStatusSelect = (statusValue) => {
    setUnitData({ ...unitData, status: statusValue });
    setIsStatusDropdownOpen(false);
  };

  const formatShamsiDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return moment(dateString).format("jYYYY/jMM/jDD");
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "تاریخ نامعتبر";
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
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
      />
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-800">
        مدیریت واحد ها
      </h1>

      {!isFormVisible && (
        <div className="flex justify-center items-center mb-5 ">
          <button
            onClick={() => {
              setIsFormVisible(true);
              resetForm();
            }}
            className="mb-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow hover:shadow-md"
            disabled={isLoading}
          >
            <FiPlus size={18} /> اضافه کردن واحد جدید
          </button>
        </div>
      )}

      {/* Add/Edit Form */}
      {isFormVisible && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-100 rounded-lg p-6 md:p-8 max-w-5xl mx-auto space-y-5 mb-8 border border-gray-200 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-center text-gray-700 mb-5">
            {editingId ? "ویرایش واحد" : "ثبت واحد جدید"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Unit Number */}
            <div>
              <label
                htmlFor="unitNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                نمبر واحد <span className="text-red-500">*</span>
              </label>
              <input
                id="unitNumber"
                required
                type="text"
                name="unit_number"
                value={unitData.unit_number}
                onChange={handleChange}
                placeholder="مثال: A-101"
                className="appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-800 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <label
                htmlFor="unitStatus"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                وضعیت <span className="text-red-500">*</span>
              </label>
              <button
                id="unitStatus"
                type="button"
                onClick={toggleStatusDropdown}
                className="appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-800 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-right flex justify-between items-center"
              >
                <span>
                  {unitData.status
                    ? statusOptions.find((s) => s.value === unitData.status)
                        ?.label
                    : "انتخاب وضعیت..."}
                </span>
                <FiChevronDown
                  className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                    isStatusDropdownOpen ? "transform rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute w-full bg-white rounded-md text-black border border-gray-300 shadow-lg z-10 mt-1 max-h-60 overflow-y-auto">
                  <ul>
                    {statusOptions.map((status) => (
                      <li
                        key={status.value}
                        className="py-2 px-4 hover:bg-indigo-50 border-b border-gray-100 text-gray-800 cursor-pointer text-sm"
                        onClick={() => handleStatusSelect(status.value)}
                      >
                        {status.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Customer Name */}
            <div>
              <label
                htmlFor="customerName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                نام ساکن / مستاجر{" "}
                {unitData.status !== "Occupied" && "(اختیاری)"}
              </label>
              <input
                id="customerName"
                type="text"
                name="customer_name"
                value={unitData.customer_name}
                onChange={handleChange}
                placeholder="نام کامل ساکن"
                disabled={unitData.status !== "Occupied"} // Disable if not occupied
                required={unitData.status === "Occupied"} // Required only if occupied
                className={`appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-800 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  unitData.status !== "Occupied"
                    ? "bg-gray-200 cursor-not-allowed"
                    : ""
                }`}
              />
            </div>

            {/* Customer Father Name */}
            <div>
              <label
                htmlFor="customerFatherName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                نام پدر ساکن {unitData.status !== "Occupied" && "(اختیاری)"}
              </label>
              <input
                id="customerFatherName"
                type="text"
                name="customer_father_name"
                value={unitData.customer_father_name}
                onChange={handleChange}
                placeholder="نام پدر ساکن"
                disabled={unitData.status !== "Occupied"} // Disable if not occupied
                className={`appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-800 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  unitData.status !== "Occupied"
                    ? "bg-gray-200 cursor-not-allowed"
                    : ""
                }`}
              />
            </div>

            {/* Service Charge */}
            <div>
              <label
                htmlFor="serviceCharge"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                شارژ خدماتی ماهانه <span className="text-red-500">*</span>
              </label>
              <input
                id="serviceCharge"
                type="number"
                name="service_charge"
                value={unitData.service_charge}
                onChange={handleChange}
                placeholder="مبلغ عددی (پیشفرض)"
                min="0"
                step="0.01" // Allow decimals
                required
                className="appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-800 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Services Description */}
            <div>
              <label
                htmlFor="servicesDescription"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                توضیحات خدمات (اختیاری)
              </label>
              <textarea
                id="servicesDescription"
                name="services_description"
                value={unitData.services_description}
                onChange={handleChange}
                placeholder="جزئیات خدمات شامل شده..."
                rows="2"
                className="appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-800 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Water Meter */}
            <div>
              <label
                htmlFor="waterMeter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                قرائت فعلی کنتور آب (اختیاری)
              </label>
              <input
                id="waterMeter"
                type="number"
                name="current_water_reading"
                value={unitData.current_water_reading}
                onChange={handleChange}
                placeholder="عدد کنتور آب"
                min="0"
                step="0.01"
                className="appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-800 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Electricity Meter */}
            <div>
              <label
                htmlFor="electricityMeter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                قرائت فعلی کنتور برق (اختیاری)
              </label>
              <input
                id="electricityMeter"
                type="number"
                name="current_electricity_reading"
                value={unitData.current_electricity_reading}
                onChange={handleChange}
                placeholder="عدد کنتور برق"
                min="0"
                step="0.01"
                className="appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-800 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Removed Photo Input */}
          </div>

          {/* Form Action Buttons */}
          <div className="flex justify-center gap-4 items-center pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 text-white py-2 px-6 rounded-md cursor-pointer hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]"
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : editingId ? (
                "بروز رسانی"
              ) : (
                "ثبت واحد"
              )}
            </button>
            <button
              onClick={() => {
                setIsFormVisible(false);
                resetForm();
              }}
              type="button"
              disabled={isLoading}
              className="bg-red-600 text-white hover:bg-red-700 cursor-pointer py-2 px-5 rounded-md transition-colors disabled:opacity-50"
            >
              انصراف
            </button>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2 md:px-4 my-5">
        <h2 className="text-lg md:text-xl font-semibold text-gray-700">
          فهرست واحدها ({filteredUnitList.length})
        </h2>
        <div className="relative w-full md:w-auto">
          <input
            type="text"
            placeholder="جستجو نمبر واحد, نام, پدر, وضعیت..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-72 px-3 py-2 pr-10 border border-gray-300 bg-gray-50 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
          />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 hover:text-gray-700"
              aria-label="پاک کردن جستجو"
            >
              <FiX className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Units Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden overflow-x-auto">
        <table className="min-w-full leading-normal border-collapse">
          <thead>
            <tr className="bg-primary text-white text-sm font-semibold uppercase tracking-wider text-right">
              {/* Removed Photo Header */}
              <th className="px-4 py-3 border-b-2 border-gray-200">
                نمبر واحد
              </th>
              <th className="px-4 py-3 border-b-2 border-gray-200">نام ساکن</th>
              <th className="px-4 py-3 border-b-2 border-gray-200">
                نام پدر ساکن
              </th>
              <th className="px-4 py-3 border-b-2 border-gray-200">
                شارژ خدماتی
              </th>
              <th className="px-4 py-3 border-b-2 border-gray-200">وضعیت</th>
              <th className="px-4 py-3 border-b-2 border-gray-200">
                تاریخ ثبت
              </th>
              <th className="px-4 py-3 border-b-2 border-gray-200 text-center">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {currentUnits.map((unit) => {
              const statusLabel =
                statusOptions.find((s) => s.value === unit.status)?.label ||
                unit.status ||
                "-";
              const creationDate = unit.created_at; // Get creation date

              return (
                <tr
                  key={unit.id}
                  className="hover:bg-gray-100 border-b border-gray-200"
                >
                  {/* Removed Photo Cell */}
                  <td className="px-4 py-2 whitespace-nowrap text-gray-900 font-medium">
                    {unit.unit_number}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                    {unit.customer_name || "-"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                    {unit.customer_father_name || "-"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                    {unit.service_charge?.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        unit.status === "Occupied"
                          ? "bg-green-100 text-green-800"
                          : unit.status === "Vacant"
                          ? "bg-yellow-100 text-yellow-800"
                          : unit.status === "Maintenance"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800" // Fallback
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                    {formatShamsiDate(creationDate)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    <div className="flex justify-center items-center gap-3">
                      <button
                        onClick={() => handleEdit(unit)}
                        className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200 transform hover:scale-110"
                        title="ویرایش"
                      >
                        <FaRegEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(unit.id)}
                        className="text-red-600 hover:text-red-800 transition-colors duration-200 transform hover:scale-110"
                        title="حذف"
                      >
                        <MdDeleteForever size={21} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {isLoading && currentUnits.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </td>
              </tr>
            )}
            {!isLoading && filteredUnitList.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-6 text-gray-500 italic"
                >
                  {unitList.length === 0
                    ? "هیچ واحدی ثبت نشده است."
                    : "واحدی با این مشخصات یافت نشد."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pageCount > 1 && (
        <div className="flex justify-center items-center p-4 gap-1 md:gap-2 text-sm">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
          >
            <FiChevronRight className="ml-1 hidden sm:inline" size={16} /> قبلی
          </button>
          {renderPageNumbers()}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pageCount || isLoading}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
          >
            بعدی <FiChevronLeft className="mr-1 hidden sm:inline" size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default UnitManager;
