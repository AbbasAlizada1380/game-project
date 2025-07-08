import React, { useState, useEffect, useMemo } from "react"; // Import useMemo
import axios from "axios";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import moment from "moment-jalaali";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import SalaryDetails from "../ServiceManager/Hook/salaryDetails";

// <<< --- ADDED: Import the new filter component --- >>>
import FilterSalaries from "./FilterSalaries"; // Adjust path as needed

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_URL = `${BASE_URL}/staff/salaries/`;
const currentYear = moment().jYear();

// Keep these constants accessible
const hijriMonths = [
  "حمل",
  "ثور",
  "جوزا",
  "سرطان",
  "اسد",
  "سنبله",
  "میزان",
  "عقرب",
  "قوس",
  "جدی",
  "دلو",
  "حوت",
];

// <<< --- ADDED: Define years array here to pass to filter component --- >>>
const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

const Salaries = () => {
  const role = useSelector((state) => state.user.currentUser.role[0]);
  const [salaries, setSalaries] = useState([]);
  const [data, setData] = useState(null); // Initialize data to null or an empty object if preferred
  const [formData, setFormData] = useState({
    month: "1",
    year: currentYear,
    total: 0,
    customers_list: 0, // Ensure this matches backend expectations (often it's staff_list or similar for salaries)
  });
  const [editingId, setEditingId] = useState(null);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // <<< --- ADDED: State variables for filters --- >>>
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  useEffect(() => {
    fetchSalaries();
  }, [isSalaryModalOpen]); // Keep original dependency if modal closure should refetch

  // <<< --- UPDATED: Reset page when filters or salary list changes --- >>>
  useEffect(() => {
    setCurrentPage(1);
  }, [salaries, filterYear, filterMonth]); // Add filters to dependency array

  const fetchSalaries = async () => {
    try {
      const response = await axios.get(API_URL);
      setSalaries(response.data);
    } catch (error) {
      console.error("Error fetching salaries:", error);
      toast.error("خطا در دریافت لیست معاشات!");
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Prepare data, potentially converting types if backend requires numbers
    const dataToSend = {
      ...formData,
      // Convert month/year to number if needed by backend
      month: parseInt(formData.month, 10),
      year: parseInt(formData.year, 10),
      // Ensure total/customers_list are handled correctly (numbers?)
      total: parseFloat(formData.total) || 0, // Example: ensure total is number
      // customers_list: formData.customers_list // Adjust if needed
    };
    try {
      if (editingId) {
        await axios.put(`${API_URL}${editingId}/`, dataToSend); // Use prepared data
        toast.success("لیست معاشات با موفقیت ویرایش شد.");
      } else {
        await axios.post(API_URL, dataToSend); // Use prepared data
        toast.success("لیست معاشات جدید با موفقیت اضافه شد.");
      }
      fetchSalaries(); // Refetch
      setFormData({
        // Reset form
        month: "1",
        year: currentYear,
        total: 0,
        customers_list: 0,
      });
      setEditingId(null);
      setIsFormVisible(false);
    } catch (error) {
      toast.error(`عملیات ${editingId ? "ویرایش" : "افزودن"} ناموفق بود.`);
      console.log(
        "Error submitting salary:",
        error.response?.data || error.message
      );
      // Optionally display specific backend errors via toast
      if (error.response && error.response.data) {
        Object.entries(error.response.data).forEach(([key, value]) => {
          const message = Array.isArray(value) ? value.join(", ") : value;
          // Avoid showing non_field_errors potentially related to uniqueness constraints in a generic way
          if (
            key !== "non_field_errors" ||
            !message.includes("already exists")
          ) {
            toast.error(`${key}: ${message}`);
          } else if (
            key === "non_field_errors" &&
            message.includes("already exists")
          ) {
            toast.error("یک لیست معاشات برای این ماه و سال قبلا ثبت شده است.");
          }
        });
      }
    }
  };

  const handleEdit = (salary) => {
    setFormData({
      month: String(salary.month), // Ensure string for select value
      year: salary.year,
      total: salary.total || 0,
      customers_list: salary.customers_list || 0, // Adjust if field name differs
    });
    setEditingId(salary.id);
    setIsFormVisible(true);
    // Optional scroll to top
    // window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      /* Original Swal config */ title: "آیا مطمئن هستید؟",
      text: "این عمل قابل بازگشت نیست!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "بله، حذف شود",
      cancelButtonText: "لغو",
      reverseButtons: true, // Keep reverse buttons if you prefer
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}${id}/`);
          fetchSalaries(); // Refetch
          toast.success("لیست معاشات مورد نظر حذف گردید.");
        } catch (error) {
          toast.error("حذف لیست معاشات ناموفق بود.");
          console.error(
            "Error deleting salary:",
            error.response?.data || error.message
          );
        }
      }
    });
  };

  // <<< --- ADDED: Memoize the filtered salary list --- >>>
  const filteredSalaries = useMemo(() => {
    return salaries.filter((salary) => {
      // Ensure year and month from data are treated as strings for comparison
      const yearMatch = filterYear
        ? String(salary.year) === String(filterYear)
        : true;
      const monthMatch = filterMonth
        ? String(salary.month) === String(filterMonth)
        : true;
      return yearMatch && monthMatch;
    });
  }, [salaries, filterYear, filterMonth]); // Dependencies

  // <<< --- UPDATED: Pagination Logic using filtered list --- >>>
  const pageCount = Math.ceil(filteredSalaries.length / itemsPerPage); // Use filtered list length
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSalaries = filteredSalaries.slice(startIndex, endIndex); // Slice the filtered list

  const handlePageChange = (pageNumber) => {
    // Add boundary checks for safety
    if (pageNumber >= 1 && pageNumber <= pageCount) {
      setCurrentPage(pageNumber);
    } else if (pageNumber < 1) {
      setCurrentPage(1);
    } else if (pageNumber > pageCount) {
      setCurrentPage(pageCount);
    }
  };

  // Original renderPageNumbers function (no style changes needed here)
  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= pageCount; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg mx-1 ${
            // KEEPING ORIGINAL CLASSES
            currentPage === i
              ? "bg-green-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  // Helper function to handle opening the details modal
  const openDetailsModal = (salaryData) => {
    setData(salaryData);
    setIsSalaryModalOpen(true);
  };
  const totalTotal = currentSalaries.reduce(
    (acc, s) => acc + (s.total || 0),
    0
  );
  const totalTaken = currentSalaries.reduce(
    (acc, s) => acc + (s.total_taken || 0),
    0
  );
  const totalRemaining = totalTotal - totalTaken;

  return (
    <div className="container mx-auto p-6">
      {" "}
      {/* KEEPING ORIGINAL CLASS */}
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
      <h1 className="text-2xl font-bold mb-4 text-center">مدیریت معاشات</h1>{" "}
      {/* KEEPING ORIGINAL CLASS */}
      {/* Add/Edit Form Button - KEEPING ORIGINAL CLASSES */}
      {!isFormVisible && (
        <div className="flex justify-center items-center mb-4">
          <button
            onClick={() => {
              setIsFormVisible(true);
              setEditingId(null);
              setFormData({
                // Reset form
                month: "1",
                year: currentYear,
                total: 0,
                customers_list: 0,
              });
            }}
            className={` ${
              role == 3 ? "hidden" : ""
            } mb-4 bg-green-500 text-white p-2 rounded`} // KEEPING ORIGINAL CLASS
          >
            اضافه کردن لیست معاشات
          </button>
        </div>
      )}
      {/* Form Section - KEEPING ORIGINAL CLASSES */}
      {isFormVisible && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-200 max-w-5xl mx-auto p-10 shadow rounded mb-4" // KEEPING ORIGINAL CLASS
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {" "}
            {/* KEEPING ORIGINAL CLASS */}
            {/* Month Select - KEEPING ORIGINAL CLASSES */}
            <div className="mb-4">
              <label
                htmlFor="month"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                {" "}
                ماه:{" "}
              </label>
              <select
                id="month"
                name="month"
                value={formData.month}
                onChange={handleInputChange}
                required
                className="shadow appearance-none border bg-white rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                {hijriMonths.map((month, index) => (
                  <option key={index} value={index + 1}>
                    {" "}
                    {month}{" "}
                  </option>
                ))}
              </select>
            </div>
            {/* Year Input - KEEPING ORIGINAL CLASSES */}
            <div className="mb-4">
              <label
                htmlFor="year"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                {" "}
                سال:{" "}
              </label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                min={currentYear - 5}
                max={currentYear + 5}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-white focus:outline-none focus:shadow-outline"
              />
            </div>
            {/* Form does not include inputs for total/customers_list, assuming they are calculated or set differently */}
          </div>
          {/* Form Buttons - KEEPING ORIGINAL CLASSES */}
          <div className="flex items-center justify-center gap-5 mt-4">
            <button
              type="submit"
              className="bg-green-600 text-white py-2 px-7 rounded-md cursor-pointer hover:bg-green-700 transition-all"
            >
              {editingId ? "ویرایش" : "افزودن"}
            </button>
            <button
              onClick={() => setIsFormVisible(false)}
              type="button"
              className="bg-red-600 text-white hover:bg-red-700 cursor-pointer py-2 px-4 rounded-md"
            >
              انصراف
            </button>
          </div>
        </form>
      )}
      {/* <<< --- ADDED: Filter Component --- >>> */}
      <FilterSalaries
        filterYear={filterYear}
        setFilterYear={setFilterYear}
        filterMonth={filterMonth}
        setFilterMonth={setFilterMonth}
        years={years} // Pass the years array
        months={hijriMonths} // Pass the month names array
      />
      {/* Salaries Table - KEEPING ORIGINAL CLASSES */}
      <div className="bg-white rounded-t-md shadow-lg overflow-hidden overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-primary text-white text-md font-semibold uppercase tracking-wider">
              <th className="border border-gray-300 py-3 px-4">ماه</th>
              <th className="border border-gray-300 py-3 px-4">سال</th>
              <th className="border border-gray-300 py-3 px-4">مجموع</th>
              <th className="border border-gray-300 py-3 px-4">پرداختی</th>
              <th className="border border-gray-300 py-3 px-4">باقی</th>
              <th
                className={`${
                  role == 3 ? "hidden" : ""
                } border border-gray-300 py-3 px-4`}
              >
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            {currentSalaries.map((salary) => (
              <tr
                key={salary.id}
                className="border-b border-gray-500 text-center hover:bg-gray-100 transition-colors duration-300"
              >
                <td
                  onClick={() => openDetailsModal(salary)}
                  className="px-5 py-3 cursor-pointer"
                >
                  <p className="text-gray-900 whitespace-no-wrap">
                    {hijriMonths[salary.month - 1]}
                  </p>
                </td>
                <td
                  onClick={() => openDetailsModal(salary)}
                  className="px-5 py-3 cursor-pointer"
                >
                  <p className="text-gray-900 whitespace-no-wrap">
                    {salary.year}
                  </p>
                </td>
                <td
                  onClick={() => openDetailsModal(salary)}
                  className="px-5 py-3 cursor-pointer"
                >
                  <p className="text-gray-900 whitespace-no-wrap">
                    {salary.total?.toLocaleString() || 0}
                  </p>
                </td>
                <td
                  onClick={() => openDetailsModal(salary)}
                  className="px-5 py-3 cursor-pointer"
                >
                  <p className="text-gray-900 whitespace-no-wrap">
                    {salary.total_taken?.toLocaleString() || 0}
                  </p>
                </td>
                <td
                  onClick={() => openDetailsModal(salary)}
                  className="px-5 py-3 cursor-pointer"
                >
                  <p className="text-gray-900 whitespace-no-wrap">
                    {(salary.total - salary.total_taken)?.toLocaleString() || 0}
                  </p>
                </td>
                <td className={`${role == 3 ? "hidden" : ""} px-5 py-3`}>
                  <div className="flex justify-center items-center gap-3">
                    <button
                      onClick={() => handleEdit(salary)}
                      className="text-blue-600 hover:text-blue-800 transition-all cursor-pointer duration-300 transform hover:scale-110"
                      title="ویرایش"
                    >
                      <FaRegEdit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(salary.id)}
                      className="text-red-600 hover:text-red-800 transition-all cursor-pointer transform duration-300 hover:scale-110"
                      title="حذف"
                    >
                      <MdDeleteForever size={24} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {/* Total Row */}
            {currentSalaries.length > 0 && (
              <tr className="bg-gray-100 font-bold text-center">
                <td colSpan="2" className="py-3 px-4">
                  مجموع کلی
                </td>
                <td className="py-3 px-4">{totalTotal.toLocaleString()}</td>
                <td className="py-3 px-4">{totalTaken.toLocaleString()}</td>
                <td className="py-3 px-4">{totalRemaining.toLocaleString()}</td>
                <td className={`${role == 3 ? "hidden" : ""} py-3 px-4`}></td>
              </tr>
            )}

            {/* No Result Message */}
            {filteredSalaries.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  {salaries.length === 0
                    ? "هیچ لیست معاشاتی ثبت نشده است."
                    : "موردی با فیلترهای انتخابی یافت نشد."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls - KEEPING ORIGINAL CLASSES */}
      {pageCount > 1 && (
        <div className="flex justify-center items-center p-4 gap-2 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            قبلی
          </button>
          {renderPageNumbers()} {/* Uses original button classes */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pageCount}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            بعدی
          </button>
        </div>
      )}
      {/* Salary Details Modal - KEEPING ORIGINAL LOGIC */}
      {isSalaryModalOpen &&
        data && ( // Ensure 'data' is not null/undefined before rendering modal
          <SalaryDetails
            data={data}
            setIsSalaryModalOpen={setIsSalaryModalOpen}
          />
        )}
    </div>
  );
};

export default Salaries;
