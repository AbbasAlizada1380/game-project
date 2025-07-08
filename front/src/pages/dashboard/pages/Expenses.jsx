import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import moment from "moment-jalaali";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FilterExpenses from "./FilterExpenses"; // Assuming this component exists
import { useSelector } from "react-redux";
// Configure moment-jalaali globally or here (optional but recommended for digits)
moment.loadPersian({ usePersianDigits: true, dialect: "persian-modern" });

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";
const API_URL = `${BASE_URL}/Expenditure/`; // Adjust if your URL differs

const floors = [
  { value: "Third Floor", label: "طبقه سوم" },
  { value: "Fourth Floor", label: "طبقه چهارم" },
  { value: "general", label: "عمومی" },
];

const months = [
  { value: 1, label: "حمل" },
  { value: 2, label: "ثور" },
  { value: 3, label: "جوزا" },
  { value: 4, label: "سرطان" },
  { value: 5, label: "اسد" },
  { value: 6, label: "سنبله" },
  { value: 7, label: "میزان" },
  { value: 8, label: "عقرب" },
  { value: 9, label: "قوس" },
  { value: 10, label: "جدی" },
  { value: 11, label: "دلو" },
  { value: 12, label: "حوت" },
];

// <<< --- Generate the fixed year range 1400-1420 for dropdowns --- >>>
const years = Array.from({ length: 1420 - 1400 + 1 }, (_, i) => 1400 + i);
// <<< --- END --- >>>

const Expenses = () => {
  const role = useSelector((state) => state.user.currentUser.role[0]);
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    floor: "",
    amount: "",
    description: "",
    month: "",
    // Initialize year as empty string for required select
    year: "",
    receiver: "",
    consumer: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterFloor, setFilterFloor] = useState("");

  // --- Fetch, Filter, Edit, Delete, Pagination functions (Keep these as they were) ---
  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [expenses, filterYear, filterMonth, filterFloor]);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(API_URL);
      setExpenses(response.data);
    } catch (error) {
      console.error("خطا در دریافت اطلاعات مصارف:", error);
      toast.error("خطا در دریافت اطلاعات مصارف!");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // No need for manual year range check, select enforces it
    const dataToSend = { ...formData };
    try {
      if (editingId) {
        await axios.put(`${API_URL}${editingId}/`, dataToSend);
        toast.success("مصرف با موفقیت ویرایش شد.");
      } else {
        await axios.post(API_URL, dataToSend);
        toast.success("مصرف جدید با موفقیت اضافه شد.");
      }
      fetchExpenses();
      setFormData({
        // Reset form
        floor: "",
        amount: "",
        description: "",
        month: "",
        year: "", // Reset year
        receiver: "",
        consumer: "",
      });
      setEditingId(null);
      setIsFormVisible(false);
    } catch (error) {
      console.error(
        "خطا در ذخیره‌سازی:",
        error.response?.data || error.message
      );
      toast.error(`عملیات ${editingId ? "ویرایش" : "افزودن"} ناموفق بود.`);
      if (error.response && error.response.data) {
        Object.entries(error.response.data).forEach(([key, value]) => {
          toast.error(
            `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
          );
        });
      }
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      floor: expense.floor || "",
      amount: expense.amount || "",
      description: expense.description || "",
      month: String(expense.month || ""),
      year: String(expense.year || ""), // Ensure year is string for select value
      receiver: expense.receiver || "",
      consumer: expense.consumer || "",
    });
    setEditingId(expense.id);
    setIsFormVisible(true);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "آیا از حذف این مصرف مطمئن هستید؟",
      text: "این عمل قابل بازگشت نیست!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "بله، حذف کن",
      cancelButtonText: "لغو",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}${id}/`);
          fetchExpenses();
          toast.success("مصرف مورد نظر با موفقیت حذف گردید.");
        } catch (error) {
          console.error("خطا در حذف:", error.response?.data || error.message);
          toast.error("حذف مصرف ناموفق بود.");
        }
      }
    });
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const yearMatch = filterYear
        ? String(exp.year) === String(filterYear)
        : true;
      const monthMatch = filterMonth
        ? String(exp.month) === String(filterMonth)
        : true;
      const floorMatch = filterFloor ? exp.floor === filterFloor : true;
      return yearMatch && monthMatch && floorMatch;
    });
  }, [expenses, filterYear, filterMonth, filterFloor]);

  const pageCount = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExpenses = filteredExpenses.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= pageCount) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= pageCount; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg mx-1 ${
            currentPage === i
              ? "bg-green-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          {" "}
          {i}{" "}
        </button>
      );
    }
    return pageNumbers;
  };

  const getMonthLabel = (value) => {
    const monthValue = Number(value);
    return months.find((m) => m.value === monthValue)?.label || value || "";
  };
  const getFloorLabel = (value) => {
    return floors.find((f) => f.value === value)?.label || value || "";
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
  // --- End Helper Functions ---
const totalAmount = filteredExpenses.reduce(
  (acc, curr) => acc + (curr.amount || 0),
  0
);

  return (
    <div className="container mx-auto p-6">
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
      <h1 className="text-2xl font-bold mb-4 text-center">مدیریت مصارف</h1>
      {!isFormVisible && (
        <div className="flex justify-center items-center mb-4">
          <button
            onClick={() => {
              setIsFormVisible(true);
              setEditingId(null);
              setFormData({
                floor: "",
                amount: "",
                description: "",
                month: "",
                year: "",
                receiver: "",
                consumer: "",
              });
            }}
            className={` ${
              role == 3 ? "hidden" : ""
            } mb-4 bg-green-500 text-white p-2 rounded`}
          >
            {" "}
            اضافه کردن لیست مصارف{" "}
          </button>
        </div>
      )}
      {isFormVisible && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-200 max-w-5xl mx-auto p-10 shadow rounded mb-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Month Select */}
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
                onChange={handleChange}
                required
                className="shadow appearance-none border bg-white rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="" disabled>
                  {" "}
                  انتخاب ماه{" "}
                </option>
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {" "}
                    {m.label}{" "}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label
                htmlFor="year"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                {" "}
                سال:{" "}
              </label>
              <select
                id="year"
                name="year"
                value={formData.year} // Value should be string to match option values
                onChange={handleChange}
                required
                className="shadow appearance-none border bg-white rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="" disabled>
                  {" "}
                  انتخاب سال
                </option>
                {years.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label
                htmlFor="amount"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                {" "}
                مقدار:{" "}
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0"
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-white focus:outline-none focus:shadow-outline [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            {/* Receiver Input */}
            <div className="mb-4">
              <label
                htmlFor="receiver"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                {" "}
                دریافت کننده:{" "}
              </label>
              <input
                type="text"
                id="receiver"
                name="receiver"
                value={formData.receiver}
                onChange={handleChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-white focus:outline-none focus:shadow-outline"
              />
            </div>
            {/* Floor Select */}
            <div className="mb-4">
              <label
                htmlFor="floor"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                {" "}
                طبقه:{" "}
              </label>
              <select
                id="floor"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                required
                className="shadow appearance-none border bg-white rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="" disabled>
                  {" "}
                  انتخاب طبقه{" "}
                </option>
                {floors.map((f) => (
                  <option key={f.value} value={f.value}>
                    {" "}
                    {f.label}{" "}
                  </option>
                ))}
              </select>
            </div>
            {/* Consumer Input */}
            <div className="mb-4">
              <label
                htmlFor="consumer"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                {" "}
                مصرف کننده:{" "}
              </label>
              <input
                type="text"
                id="consumer"
                name="consumer"
                value={formData.consumer}
                onChange={handleChange}
                placeholder="نام شخص یا بخش (اختیاری)"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-white focus:outline-none focus:shadow-outline"
              />
            </div>
            {/* Description Textarea */}
            <div className="mb-4 md:col-span-3">
              <label
                htmlFor="description"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                {" "}
                توضیحات:{" "}
              </label>
              <textarea
                id="description"
                name="description"
                rows={2}
                value={formData.description}
                onChange={handleChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-white focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>
          {/* Form Buttons */}
          <div className="flex items-center justify-center gap-5 mt-4">
            <button
              type="submit"
              className="bg-green-600 text-white py-2 px-7 rounded-md cursor-pointer hover:bg-green-700 transition-all"
            >
              {" "}
              {editingId ? "ویرایش" : "افزودن"}{" "}
            </button>
            <button
              onClick={() => setIsFormVisible(false)}
              type="button"
              className="bg-red-600 text-white hover:bg-red-700 cursor-pointer py-2 px-4 rounded-md"
            >
              {" "}
              انصراف{" "}
            </button>
          </div>
        </form>
      )}

      {/* Filter Component */}
      <FilterExpenses
        filterYear={filterYear}
        setFilterYear={setFilterYear}
        filterMonth={filterMonth}
        setFilterMonth={setFilterMonth}
        filterFloor={filterFloor}
        setFilterFloor={setFilterFloor}
        years={years} // Pass the fixed years array [1400, ..., 1420]
        months={months}
        floors={floors}
      />

      {/* Expenses Table */}
      <div className="bg-white rounded-t-md shadow-lg overflow-hidden overflow-x-auto">
        <table className="min-w-full leading-normal">
          {/* Table Head */}
          <thead>
            <tr className="bg-primary text-white text-md font-semibold uppercase tracking-wider">
              <th className="border border-gray-300 py-3 px-4">ماه</th>
              <th className="border border-gray-300 py-3 px-4">سال</th>
              <th className="border border-gray-300 py-3 px-4">مقدار</th>
              <th className="border border-gray-300 py-3 px-4">توضیحات</th>
              <th className="border border-gray-300 py-3 px-4">دریافت کننده</th>
              <th className="border border-gray-300 py-3 px-4">طبقه</th>
              <th className="border border-gray-300 py-3 px-4">مصرف کننده</th>
              <th className="border border-gray-300 py-3 px-4">تاریخ ثبت</th>
              <th
                className={`${
                  role == 3 ? "hidden" : ""
                } border border-gray-300 py-3 px-4`}
              >
                عملیات
              </th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {currentExpenses.map((expense) => (
              <tr
                key={expense.id}
                className="border-b border-gray-500 text-center hover:bg-gray-100 transition-colors duration-300 "
              >
                <td className="px-5 py-3">
                  {" "}
                  <p className="text-gray-900 whitespace-no-wrap">
                    {" "}
                    {getMonthLabel(expense.month)}{" "}
                  </p>{" "}
                </td>
                <td className="px-5 py-3">
                  {" "}
                  <p className="text-gray-900 whitespace-no-wrap">
                    {" "}
                    {expense.year}{" "}
                  </p>{" "}
                </td>
                <td className="px-5 py-3">
                  {" "}
                  <p className="text-gray-900 whitespace-no-wrap">
                    {" "}
                    {expense.amount?.toLocaleString() || "-"}{" "}
                  </p>{" "}
                </td>
                <td className="px-5 py-3">
                  {" "}
                  <p
                    className="text-gray-900 whitespace-no-wrap truncate max-w-xs"
                    title={expense.description}
                  >
                    {" "}
                    {expense.description || "-"}{" "}
                  </p>{" "}
                </td>
                <td className="px-5 py-3">
                  {" "}
                  <p className="text-gray-900 whitespace-no-wrap">
                    {" "}
                    {expense.receiver || "-"}{" "}
                  </p>{" "}
                </td>
                <td className="px-5 py-3">
                  {" "}
                  <p className="text-gray-900 whitespace-no-wrap">
                    {" "}
                    {getFloorLabel(expense.floor)}{" "}
                  </p>{" "}
                </td>
                <td className="px-5 py-3">
                  {" "}
                  <p className="text-gray-900 whitespace-no-wrap">
                    {" "}
                    {expense.consumer || "-"}{" "}
                  </p>{" "}
                </td>
                <td className="px-5 py-3">
                  {" "}
                  <p className="text-gray-900 whitespace-no-wrap">
                    {" "}
                    {formatShamsiDate(expense.created_at)}{" "}
                  </p>{" "}
                </td>
                <td className={`${role == 3 ? "hidden" : ""} px-5 py-3`}>
                  <div className="flex justify-center items-center gap-3">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="text-blue-600 hover:text-blue-800 transition-all cursor-pointer duration-300 transform hover:scale-110"
                      title="ویرایش"
                    >
                      <FaRegEdit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="text-red-600 hover:text-red-800 transition-all cursor-pointer duration-300 transform hover:scale-110"
                      title="حذف"
                    >
                      <MdDeleteForever size={24} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            <tr className="bg-gray-100 font-bold text-center">
              <td colSpan="2" className="py-3 px-4">
                مجموع کلی
              </td>
              <td className="py-3 px-4">{totalAmount.toLocaleString()}</td>
              <td colSpan="6"></td>
            </tr>
            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center py-6 text-gray-500">
                  {expenses.length === 0
                    ? "هیچ مصرفی ثبت نشده است."
                    : "موردی با فیلترهای انتخابی یافت نشد."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-center items-center p-4 gap-2 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            قبلی
          </button>
          {renderPageNumbers()}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pageCount}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            بعدی
          </button>
        </div>
      )}
    </div>
  );
};

export default Expenses;
