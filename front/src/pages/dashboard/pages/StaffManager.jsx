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
import moment from "moment-jalaali"; // <--- Import moment-jalaali

// Configure moment-jalaali to use Persian numbering and format (optional but recommended)
moment.loadPersian({ usePersianDigits: true, dialect: "persian-modern" });

const positionOptions = [
  { value: "Gard", label: "نگهبان" },
  { value: "Manager", label: "مدیر" },
  { value: "Electrical", label: "برقکار" },
  { value: "Cleaner", label: "نظافتچی" },
  { value: "Cooker", label: "آشپز" },
  { value: "FinancialManager", label: "مدیر مالی" },
];

const statusOptions = [
  { value: "Active", label: "فعال" },
  { value: "Inactive", label: "غیرفعال" },
];

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";
// *** IMPORTANT: Make sure your API endpoint returns a date field for staff ***
// *** Common names are 'created_at', 'date_joined'. Adjust the field name ***
// *** in the table section below if yours is different. ***
const API_URL = `${BASE_URL}/staff/staff/`;
const itemsPerPage =15;

const StaffManager = () => {
  const [staffData, setStaffData] = useState({
    name: "",
    father_name: "",
    nic: "",
    address: "",
    position: "",
    salary: "",
    status: "",
    // Assuming 'created_at' is not part of the form data itself
  });
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStaffList, setFilteredStaffList] = useState([]);
  const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    filterStaffList(searchTerm);
    setCurrentPage(1);
  }, [staffList, searchTerm]);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL);
      // Ensure response.data includes the creation date field from the backend
      setStaffList(response.data || []);
    } catch (error) {
      console.error("Error fetching staff data:", error);
      toast.error("خطا در دریافت اطلاعات کارمندان!");
    } finally {
      setIsLoading(false);
    }
  };

  const filterStaffList = (term) => {
    const lowerSearchTerm = term.toLowerCase().trim();
    if (!lowerSearchTerm) {
      setFilteredStaffList(staffList);
      return;
    }
    const filtered = staffList.filter((staff) => {
      const positionLabel =
        positionOptions.find((p) => p.value === staff.position)?.label || "";
      // No need to filter by Shamsi date usually, keep filtering logic simple
      return (
        staff.name?.toLowerCase().includes(lowerSearchTerm) ||
        staff.father_name?.toLowerCase().includes(lowerSearchTerm) ||
        staff.position?.toLowerCase().includes(lowerSearchTerm) ||
        positionLabel.toLowerCase().includes(lowerSearchTerm) ||
        staff.nic?.toLowerCase().includes(lowerSearchTerm)
      );
    });
    setFilteredStaffList(filtered);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStaffData({ ...staffData, [name]: value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم عکس نباید بیشتر از 5MB باشد.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("لطفا فقط فایل عکس انتخاب کنید.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setSelectedPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentPhotoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedPhotoFile(null);
      const originalPhoto = editingId
        ? staffList.find((s) => s.id === editingId)?.photo
        : null;
      setCurrentPhotoUrl(originalPhoto || null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formDataToSend = new FormData();

    Object.keys(staffData).forEach((key) => {
      if (
        staffData[key] !== null &&
        staffData[key] !== undefined &&
        staffData[key] !== ""
      ) {
        formDataToSend.append(key, staffData[key]);
      } else if (key === "position" || key === "status") {
        formDataToSend.append(key, "");
      }
    });

    if (selectedPhotoFile) {
      formDataToSend.append("photo", selectedPhotoFile, selectedPhotoFile.name);
    }

    const url = editingId ? `${API_URL}${editingId}/` : API_URL;
    const method = editingId ? "patch" : "post";

    try {
      await axios({
        method,
        url,
        data: formDataToSend,
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchStaff();
      toast.success(`کارمند با موفقیت ${editingId ? "بروزرسانی" : "ثبت"} شد.`);
      resetForm();
      setIsFormVisible(false);
    } catch (error) {
      console.error(
        "Error saving staff:",
        error.response?.data || error.message
      );
      let errorMsg = `خطا در ${editingId ? "بروزرسانی" : "ثبت"} کارمند.`;
      if (error.response && error.response.data) {
        const errors = error.response.data;
        if (typeof errors === "string") errorMsg += ` (${errors})`;
        else if (errors.detail) errorMsg += ` (${errors.detail})`;
        else if (typeof errors === "object") {
          const messages = Object.entries(errors)
            .map(
              ([key, value]) =>
                `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
            )
            .join(" | ");
          if (messages) errorMsg += ` (${messages})`;
        }
      }
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStaffData({
      name: "",
      father_name: "",
      nic: "",
      address: "",
      position: "",
      salary: "",
      status: "",
    });
    setSelectedPhotoFile(null);
    setCurrentPhotoUrl(null);
    setEditingId(null);
    setIsPositionDropdownOpen(false);
    setIsStatusDropdownOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "آیا از حذف این کارمند مطمئن هستید؟",
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
          await fetchStaff();
          toast.success("کارمند با موفقیت حذف شد.");
        } catch (error) {
          console.error("Error deleting staff:", error);
          toast.error("در هنگام حذف کارمند خطایی رخ داد.");
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleEdit = (staff) => {
    setEditingId(staff.id);
    const { photo, ...restOfStaffData } = staff;
    setStaffData({
      name: restOfStaffData.name || "",
      father_name: restOfStaffData.father_name || "",
      nic: restOfStaffData.nic || "",
      address: restOfStaffData.address || "",
      position: restOfStaffData.position || "",
      salary: restOfStaffData.salary || "",
      status: restOfStaffData.status || "",
    });
    setCurrentPhotoUrl(photo || null);
    setSelectedPhotoFile(null);
    setIsFormVisible(true);
    setIsPositionDropdownOpen(false);
    setIsStatusDropdownOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= pageCount) {
      setCurrentPage(pageNumber);
    }
  };

  const pageCount = Math.ceil(filteredStaffList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStaff = filteredStaffList.slice(startIndex, endIndex);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
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
          {" "}
          {i}{" "}
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

  const togglePositionDropdown = () => {
    setIsPositionDropdownOpen(!isPositionDropdownOpen);
    setIsStatusDropdownOpen(false);
  };
  const toggleStatusDropdown = () => {
    setIsStatusDropdownOpen(!isStatusDropdownOpen);
    setIsPositionDropdownOpen(false);
  };
  const handlePositionSelect = (positionValue) => {
    setStaffData({ ...staffData, position: positionValue });
    setIsPositionDropdownOpen(false);
  };
  const handleStatusSelect = (statusValue) => {
    setStaffData({ ...staffData, status: statusValue });
    setIsStatusDropdownOpen(false);
  };

  // --- Helper function to format date ---
  const formatShamsiDate = (dateString) => {
    if (!dateString) return "-"; // Handle cases where date is null or undefined
    try {
      // Assuming dateString is in ISO 8601 format (e.g., "2024-04-12T10:30:00Z")
      // Adjust format as needed ('jYYYY/jM/jD' is also common)
      return moment(dateString).format("jYYYY/jMM/jDD");
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "تاریخ نامعتبر"; // Fallback for invalid dates
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
        مدیریت کارمندان
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
            <FiPlus size={18} /> اضافه کردن کارمند
          </button>
        </div>
      )}

      {isFormVisible && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-100 rounded-lg p-6 md:p-8 max-w-5xl mx-auto space-y-5 mb-8 border border-gray-200 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-center text-gray-700 mb-5">
            {" "}
            {editingId ? "ویرایش کارمند" : "ثبت کارمند جدید"}{" "}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label
                htmlFor="staffName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                نام <span className="text-red-500">*</span>
              </label>
              <input
                id="staffName"
                required
                type="text"
                name="name"
                value={staffData.name}
                onChange={handleChange}
                placeholder="نام کامل"
                className="appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-800 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="staffFatherName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                نام پدر <span className="text-red-500">*</span>
              </label>
              <input
                id="staffFatherName"
                required
                type="text"
                name="father_name"
                value={staffData.father_name}
                onChange={handleChange}
                placeholder="نام پدر"
                className="appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-800 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="staffNic"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                شماره تذکره
              </label>
              <input
                id="staffNic"
                type="text"
                name="nic"
                value={staffData.nic}
                onChange={handleChange}
                placeholder="اختیاری"
                dir="ltr"
                className="appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-800 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="staffAddress"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                آدرس
              </label>
              <input
                id="staffAddress"
                type="text"
                name="address"
                value={staffData.address}
                onChange={handleChange}
                placeholder="اختیاری"
                className="appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-800 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <label
                htmlFor="staffPosition"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                موقعیت <span className="text-red-500">*</span>
              </label>
              <button
                id="staffPosition"
                type="button"
                onClick={togglePositionDropdown}
                className="appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-800 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-right flex justify-between items-center"
              >
                <span>
                  {" "}
                  {staffData.position
                    ? positionOptions.find(
                        (pos) => pos.value === staffData.position
                      )?.label
                    : "انتخاب موقعیت..."}{" "}
                </span>
                <FiChevronDown
                  className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                    isPositionDropdownOpen ? "transform rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
              {isPositionDropdownOpen && (
                <div className="absolute w-full bg-white rounded-md text-black border border-gray-300 shadow-lg z-10 mt-1 max-h-60 overflow-y-auto">
                  <ul>
                    {" "}
                    {positionOptions.map((pos) => (
                      <li
                        key={pos.value}
                        className="py-2 px-4 hover:bg-indigo-50 border-b border-gray-100 text-gray-800 cursor-pointer text-sm"
                        onClick={() => handlePositionSelect(pos.value)}
                      >
                        {" "}
                        {pos.label}{" "}
                      </li>
                    ))}{" "}
                  </ul>
                </div>
              )}
            </div>
            <div>
              <label
                htmlFor="staffSalary"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                حقوق <span className="text-red-500">*</span>
              </label>
              <input
                id="staffSalary"
                type="number"
                name="salary"
                value={staffData.salary}
                onChange={handleChange}
                placeholder="مقدار عددی"
                min="0"
                required
                className="appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-800 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <label
                htmlFor="staffStatus"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                وضعیت <span className="text-red-500">*</span>
              </label>
              <button
                id="staffStatus"
                type="button"
                onClick={toggleStatusDropdown}
                className="appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-800 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-right flex justify-between items-center"
              >
                <span>
                  {" "}
                  {staffData.status
                    ? statusOptions.find((s) => s.value === staffData.status)
                        ?.label
                    : "انتخاب وضعیت..."}{" "}
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
                    {" "}
                    {statusOptions.map((status) => (
                      <li
                        key={status.value}
                        className="py-2 px-4 hover:bg-indigo-50 border-b border-gray-100 text-gray-800 cursor-pointer text-sm"
                        onClick={() => handleStatusSelect(status.value)}
                      >
                        {" "}
                        {status.label}{" "}
                      </li>
                    ))}{" "}
                  </ul>
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="staffPhoto"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                عکس (اختیاری)
              </label>
              <input
                id="staffPhoto"
                type="file"
                name="photo"
                onChange={handleFileChange}
                ref={fileInputRef}
                accept="image/png, image/jpeg, image/gif"
                className="appearance-none border border-gray-300 rounded w-full text-sm text-gray-500 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-l-none file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {currentPhotoUrl && (
                <div className="mt-3">
                  {" "}
                  <p className="text-xs text-gray-600 mb-1">
                    عکس فعلی / پیش‌نمایش:
                  </p>{" "}
                  <img
                    src={currentPhotoUrl}
                    alt="Staff Preview"
                    className="h-20 w-20 object-cover rounded border border-gray-300"
                  />{" "}
                </div>
              )}
            </div>
          </div>
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
                "ثبت کارمند"
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
              {" "}
              انصراف{" "}
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2 md:px-4 my-5">
        <h2 className="text-lg md:text-xl font-semibold text-gray-700">
          {" "}
          فهرست کارمندان ({filteredStaffList.length}){" "}
        </h2>
        <div className="relative w-full md:w-auto">
          <input
            type="text"
            placeholder="جستجو نام, پدر, موقعیت, تذکره..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-72 px-3 py-2 pr-10 border border-gray-300 bg-gray-50 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
          />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            {" "}
            <FaSearch className="text-gray-400" />{" "}
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 hover:text-gray-700"
              aria-label="پاک کردن جستجو"
            >
              {" "}
              <FiX className="h-5 w-5" />{" "}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden overflow-x-auto">
        <table className="min-w-full leading-normal border-collapse">
          <thead>
            <tr className="bg-primary text-white text-sm font-semibold uppercase tracking-wider text-right">
              <th className="px-4 py-3 border-b-2 border-gray-200">تصویر</th>
              <th className="px-4 py-3 border-b-2 border-gray-200">نام</th>
              <th className="px-4 py-3 border-b-2 border-gray-200">نام پدر</th>
              <th className="px-4 py-3 border-b-2 border-gray-200">موقعیت</th>
              <th className="px-4 py-3 border-b-2 border-gray-200">حقوق</th>
              <th className="px-4 py-3 border-b-2 border-gray-200">وضعیت</th>
              {/* --- ADDED: Header for Creation Date --- */}
              <th className="px-4 py-3 border-b-2 border-gray-200">
                تاریخ ثبت
              </th>
              <th className="px-4 py-3 border-b-2 border-gray-200 text-center">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {currentStaff.map((staff) => {
              const positionLabel =
                positionOptions.find((p) => p.value === staff.position)
                  ?.label ||
                staff.position ||
                "-";
              const statusLabel =
                statusOptions.find((s) => s.value === staff.status)?.label ||
                staff.status ||
                "-";
              // *** Assume staff object has 'created_at' field from API ***
              const creationDate = staff.created_at; // Or 'date_joined', etc.

              return (
                <tr
                  key={staff.id}
                  className="hover:bg-gray-100 border-b border-gray-200"
                >
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex justify-center items-center">
                      {staff.photo ? (
                        <img
                          src={staff.photo}
                          alt={staff.name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xl">
                          ?
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-900">
                    {staff.name}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                    {staff.father_name}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                    {positionLabel}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                    {staff.salary} 
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {" "}
                    <span
                      className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        staff.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {" "}
                      {statusLabel}{" "}
                    </span>{" "}
                  </td>
                  {/* --- ADDED: Cell for Shamsi Date --- */}
                  <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                    {formatShamsiDate(creationDate)}{" "}
                    {/* Call formatting function */}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    <div className="flex justify-center items-center gap-3">
                      <button
                        onClick={() => handleEdit(staff)}
                        className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200 transform hover:scale-110"
                        title="ویرایش"
                      >
                        {" "}
                        <FaRegEdit size={18} />{" "}
                      </button>
                      <button
                        onClick={() => handleDelete(staff.id)}
                        className="text-red-600 hover:text-red-800 transition-colors duration-200 transform hover:scale-110"
                        title="حذف"
                      >
                        {" "}
                        <MdDeleteForever size={21} />{" "}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {/* --- Adjust ColSpan for loading/no results --- */}
            {isLoading && currentStaff.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </td>
              </tr>
            )}
            {!isLoading && filteredStaffList.length === 0 && (
              <tr>
                {" "}
                <td
                  colSpan="8"
                  className="text-center py-6 text-gray-500 italic"
                >
                  {" "}
                  {staffList.length === 0
                    ? "هیچ کارمندی ثبت نشده است."
                    : "کارمندی با این مشخصات یافت نشد."}{" "}
                </td>{" "}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex justify-center items-center p-4 gap-1 md:gap-2 text-sm">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
          >
            {" "}
            <FiChevronRight
              className="ml-1 hidden sm:inline"
              size={16}
            /> قبلی{" "}
          </button>
          {renderPageNumbers()}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pageCount || isLoading}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
          >
            {" "}
            بعدی <FiChevronLeft
              className="mr-1 hidden sm:inline"
              size={16}
            />{" "}
          </button>
        </div>
      )}
    </div>
  );
};

export default StaffManager;
