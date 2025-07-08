
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import moment from "moment-jalaali";
import { MdDeleteForever } from "react-icons/md";
import { FiPlus, FiChevronLeft, FiChevronRight } from "react-icons/fi"; 
import UnitBillDetails from "./UnitBillDetails"; 
import FilterUnitBills from "./FilterUnitBills";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";
const API_URL = `${BASE_URL}/units/bills/`; 
const currentYear = moment().jYear();

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

const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

const UnitBillManager = () => {
  const role = useSelector((state) => state.user.currentUser.role[0]);
  const [unitBills, setUnitBills] = useState([]); // List of bill periods
  const [selectedBillData, setSelectedBillData] = useState(null); // Data for the details modal
  const [formData, setFormData] = useState({
    month: String(moment().jMonth() + 1), // Default to current month
    year: String(currentYear), // Default to current year
  });
  const [editingId, setEditingId] = useState(null); // Tracks if main form is for editing (likely unused now)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // Controls details modal visibility
  const [isFormVisible, setIsFormVisible] = useState(false); // Controls add form visibility
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 15;
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  useEffect(() => {
    fetchUnitBills();
  }, [isDetailsModalOpen]); 

  useEffect(() => {
    setCurrentPage(1);
  }, [unitBills, filterYear, filterMonth]);

  const fetchUnitBills = async () => {
    setIsLoading(true); 
    try {
      const response = await axios.get(API_URL);
      setUnitBills(response.data || []); 
    } catch (error) {
      console.error("Error fetching unit bills:", error);
      toast.error("خطا در دریافت لیست بل واحدها!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const dataToSend = {
      month: parseInt(formData.month, 10),
      year: parseInt(formData.year, 10),
    };

    if (editingId) {
      toast.info("برای ویرایش جزئیات، روی ردیف جدول کلیک کنید.");
      setIsLoading(false);
      setIsFormVisible(false); 
      setEditingId(null);
      return; 
    }

  
    try {
      await axios.post(API_URL, dataToSend);
      toast.success("دوره بل جدید با موفقیت اضافه شد.");
      fetchUnitBills(); 
      resetForm();
      setIsFormVisible(false);
    } catch (error) {
      toast.error("عملیات افزودن دوره بل ناموفق بود.");
      console.error(
        "Error submitting unit bill:",
        error.response?.data || error.message
      );
      if (error.response && error.response.data) {
        const errors = error.response.data;
        if (
          errors.non_field_errors &&
          errors.non_field_errors[0].includes("unique set")
        ) {
          toast.error("یک دوره بل برای این ماه و سال قبلا ثبت شده است.");
        } else {
          Object.entries(errors).forEach(([key, value]) => {
            toast.error(
              `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
            );
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      month: String(moment().jMonth() + 1), 
      year: String(currentYear),
    });
    setEditingId(null);
  };
  const handleEdit = (unitBill) => {
    openDetailsModal(unitBill);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: "تمام جزئیات پرداخت این دوره حذف خواهد شد!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "بله، حذف شود",
      cancelButtonText: "لغو",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        try {
          await axios.delete(`${API_URL}${id}/`);
          fetchUnitBills(); // Refetch
          toast.success("دوره بل مورد نظر حذف گردید.");
          if (
            currentPage > 1 &&
            currentUnitBills.length === 1 &&
            filteredUnitBills.length > 1
          ) {
            handlePageChange(currentPage - 1);
          }
        } catch (error) {
          toast.error("حذف دوره بل ناموفق بود.");
          console.error(
            "Error deleting unit bill:",
            error.response?.data || error.message
          );
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const filteredUnitBills = useMemo(() => {
    return unitBills.filter((bill) => {
      const yearMatch = filterYear
        ? String(bill.year) === String(filterYear)
        : true;
      const monthMatch = filterMonth
        ? String(bill.month) === String(filterMonth)
        : true;
      return yearMatch && monthMatch;
    });
  }, [unitBills, filterYear, filterMonth]);

  const pageCount = Math.ceil(filteredUnitBills.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUnitBills = filteredUnitBills.slice(startIndex, endIndex);
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= pageCount) {
      setCurrentPage(pageNumber);
    }
  };

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
          {" "}
          1{" "}
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
          {" "}
          {pageCount}{" "}
        </button>
      );
    }
    return pageNumbers;
  };

  const openDetailsModal = (billData) => {
    setSelectedBillData(billData); 
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <ToastContainer position="top-center" autoClose={4000} />
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-800">
        مدیریت بل واحدها
      </h1>

      {!isFormVisible && (
        <div className="flex justify-center items-center mb-5">
          <button
            onClick={() => {
              setIsFormVisible(true);
              resetForm();
            }}
            className={` ${
              role == 3 ? "hidden" : ""
            } mb-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow hover:shadow-md`}
            disabled={isLoading}
          >
            <FiPlus size={18} /> افزودن دوره بل جدید
          </button>
        </div>
      )}

      {/* Add Bill Period Form */}
      {isFormVisible && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-100 rounded-lg p-6 md:p-8 max-w-lg mx-auto space-y-5 mb-8 border border-gray-200 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-center text-gray-700 mb-5">
            افزودن دوره بل جدید
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Month Select */}
            <div className="mb-4">
              <label
                htmlFor="month"
                className="block text-gray-700 text-sm font-medium mb-1"
              >
                ماه:
              </label>
              <select
                id="month"
                name="month"
                value={formData.month}
                onChange={handleInputChange}
                required
                className="appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-800 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {hijriMonths.map((month, index) => (
                  <option key={index} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            {/* Year Input */}
            <div className="mb-4">
              <label
                htmlFor="year"
                className="block text-gray-700 text-sm font-medium mb-1"
              >
                سال:
              </label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                min={currentYear - 10} // Adjust range as needed
                max={currentYear + 10}
                required
                className="appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-800 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          {/* Form Buttons */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 text-white py-2 px-6 rounded-md cursor-pointer hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white" /* SVG code */
                ></svg>
              ) : (
                "افزودن"
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

      {/* Filter Component */}
      <FilterUnitBills
        filterYear={filterYear}
        setFilterYear={setFilterYear}
        filterMonth={filterMonth}
        setFilterMonth={setFilterMonth}
        years={years}
        months={hijriMonths}
      />

      {/* Unit Bills Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden overflow-x-auto">
        <table className="min-w-full leading-normal border-collapse">
          <thead>
            <tr className="bg-primary text-white text-sm font-semibold uppercase tracking-wider text-center">
              <th className="px-4 py-3 border-b-2 border-gray-200">ماه</th>
              <th className="px-4 py-3 border-b-2 border-gray-200">سال</th>
              <th className="px-4 py-3 border-b-2 border-gray-200">
                مجموع شارژ
              </th>
              <th className="px-4 py-3 border-b-2 border-gray-200">
                مجموع پرداختی
              </th>
              <th className="px-4 py-3 border-b-2 border-gray-200">
                مجموع باقی
              </th>
              <th
                className={`${
                  role == 3 ? "hidden" : ""
                } px-4 py-3 border-b-2 border-gray-200`}
              >
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {/* Map over filtered and paginated bills */}
            {currentUnitBills.map((bill) => (
              <tr
                key={bill.id}
                className="hover:bg-gray-100 border-b border-gray-200 text-center cursor-pointer" // Make row clickable
                onClick={() => openDetailsModal(bill)} // Open modal on row click
              >
                <td className="px-4 py-3 whitespace-nowrap text-gray-800">
                  {hijriMonths[bill.month - 1]}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-800">
                  {bill.year}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                  {bill.total?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || "0.00"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-green-700">
                  {bill.total_paid?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || "0.00"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-red-700 font-medium">
                  {bill.total_remainder?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || "0.00"}
                </td>
                {/* Action Buttons Cell */}
                <td
                  className={`${
                    role == 3 ? "hidden" : ""
                  } px-4 py-3 whitespace-nowrap`}
                >
                  <div className="flex justify-center items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(bill.id);
                      }} // Prevent row click event
                      className="text-red-600 hover:text-red-800 transition-colors duration-200 transform hover:scale-110"
                      title="حذف دوره بل"
                    >
                      <MdDeleteForever size={21} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {/* Total Row */}
            {filteredUnitBills.length > 0 && (
              <tr className="bg-gray-100 font-bold text-center">
                <td className="px-4 py-3" colSpan={2}>
                  مجموع کل
                </td>
                <td className="px-4 py-3 text-gray-900">
                  {filteredUnitBills
                    .reduce(
                      (sum, bill) => sum + (parseFloat(bill.total) || 0),
                      0
                    )
                    .toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </td>
                <td className="px-4 py-3 text-green-700">
                  {filteredUnitBills
                    .reduce(
                      (sum, bill) => sum + (parseFloat(bill.total_paid) || 0),
                      0
                    )
                    .toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </td>
                <td className="px-4 py-3 text-red-700">
                  {filteredUnitBills
                    .reduce(
                      (sum, bill) =>
                        sum + (parseFloat(bill.total_remainder) || 0),
                      0
                    )
                    .toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </td>
                <td className={`${role == 3 ? "hidden" : ""} px-4 py-3`}></td>
              </tr>
            )}

            {/* Loading and No Results Rows */}
            {isLoading && currentUnitBills.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </td>
              </tr>
            )}
            {!isLoading && filteredUnitBills.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 text-gray-500 italic"
                >
                  {unitBills.length === 0
                    ? "هیچ دوره بل ثبت نشده است."
                    : "موردی با فیلترهای انتخابی یافت نشد."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pageCount > 1 && (
        <div className="flex justify-center items-center p-4 gap-1 md:gap-2 text-sm mt-4">
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

      {isDetailsModalOpen && selectedBillData && (
        <UnitBillDetails
          data={selectedBillData}
          setIsUnitBillModalOpen={setIsDetailsModalOpen}
        />
      )}
    </div>
  );
};

export default UnitBillManager;
