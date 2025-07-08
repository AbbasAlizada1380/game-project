import React, { useState, useEffect, useMemo } from "react"; // Import useMemo
import axios from "axios";
import Swal from "sweetalert2";
import moment from "moment-jalaali";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import the new filter component
import FilterIncomes from "./FilterIncomes"; // Adjust path as needed
import { useSelector } from "react-redux";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_URL = `${BASE_URL}/Expenditure/income/`;
const currentYear = moment().jYear();

// Keep these constants accessible
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

// Define years array here to pass to filter component
const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

const Incomes = () => {
  const role = useSelector((state) => state.user.currentUser.role[0]);
  const [incomes, setIncomes] = useState([]);
  const [formData, setFormData] = useState({
    source: "",
    amount: "",
    description: "",
    month: "",
    year: currentYear.toString(),
    receiver: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [expandedDescriptionId, setExpandedDescriptionId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // <<< --- ADDED: State variables for filters --- >>>
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  useEffect(() => {
    fetchIncomes();
  }, []);

  // <<< --- UPDATED: Reset page when filters or income list changes --- >>>
  useEffect(() => {
    setCurrentPage(1);
  }, [incomes, filterYear, filterMonth]); // Add filters to dependency array

  const fetchIncomes = async () => {
    try {
      const response = await axios.get(API_URL);
      setIncomes(response.data);
    } catch (error) {
      console.error("خطا در دریافت اطلاعات درآمد:", error);
      toast.error("خطا در دریافت اطلاعات درآمد!");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Prepare data, potentially converting types if backend requires numbers
    const dataToSend = {
      ...formData,
      // Example conversion (adjust if not needed):
      // month: formData.month ? parseInt(formData.month, 10) : null,
      // year: formData.year ? parseInt(formData.year, 10) : currentYear,
      // amount: formData.amount ? parseFloat(formData.amount) : 0,
    };
    try {
      if (editingId) {
        await axios.put(`${API_URL}${editingId}/`, dataToSend); // or formData
        toast.success("درآمد با موفقیت ویرایش شد.");
      } else {
        await axios.post(API_URL, dataToSend); // or formData
        toast.success("درآمد جدید با موفقیت اضافه شد.");
      }
      fetchIncomes(); // Refetch
      setFormData({
        // Reset form
        source: "",
        amount: "",
        description: "",
        month: "",
        year: currentYear.toString(),
        receiver: "",
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

  const handleEdit = (income) => {
    setFormData({
      source: income.source || "",
      amount: income.amount || "",
      description: income.description || "",
      month: String(income.month || ""), // Ensure string for select
      year: String(income.year || currentYear),
      receiver: income.receiver || "",
    });
    setEditingId(income.id);
    setIsFormVisible(true);
    // Optional scroll to top
    // window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      /* Original Swal config */ title: "آیا از حذف این درآمد مطمئن هستید؟",
      text: "این عمل قابل بازگشت نیست!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "بله، حذف کن",
      cancelButtonText: "انصراف",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}${id}/`);
          fetchIncomes(); // Refetch
          toast.success("درآمد مورد نظر با موفقیت حذف گردید.");
        } catch (error) {
          console.error("خطا در حذف:", error.response?.data || error.message);
          toast.error("حذف درآمد ناموفق بود.");
        }
      }
    });
  };

  // <<< --- ADDED: Memoize the filtered income list --- >>>
  const filteredIncomes = useMemo(() => {
    return incomes.filter((inc) => {
      const yearMatch = filterYear
        ? String(inc.year) === String(filterYear)
        : true;
      const monthMatch = filterMonth
        ? String(inc.month) === String(filterMonth)
        : true;
      return yearMatch && monthMatch;
    });
  }, [incomes, filterYear, filterMonth]); // Dependencies

  // <<< --- UPDATED: Pagination Logic using filtered list --- >>>
  const pageCount = Math.ceil(filteredIncomes.length / itemsPerPage); // Use filtered list length
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIncomes = filteredIncomes.slice(startIndex, endIndex); // Slice the filtered list

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= pageCount) {
      // Basic boundary check
      setCurrentPage(pageNumber);
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

  // Original toggleDescription/truncateDescription (no changes needed)
  const toggleDescription = (id) => {
    setExpandedDescriptionId(expandedDescriptionId === id ? null : id);
  };
  const truncateDescription = (description, maxLength) => {
    if (!description) return "";
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + "...";
  };

  // Original getMonthLabel (no changes needed)
  const getMonthLabel = (value) => {
    const monthValue = Number(value);
    return months.find((m) => m.value === monthValue)?.label || value || "";
  };

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
      <h1 className="text-2xl font-bold mb-4 text-center">مدیریت درآمد</h1>{" "}
      {/* KEEPING ORIGINAL CLASS */}
      {/* Add/Edit Form Button - KEEPING ORIGINAL CLASSES */}
      {!isFormVisible && (
        <div className="flex justify-center items-center mb-4">
          <button
            onClick={() => {
              setIsFormVisible(true);
              setEditingId(null);
              setFormData({
                /* Reset form */ source: "",
                amount: "",
                description: "",
                month: "",
                year: currentYear.toString(),
                receiver: "",
              });
            }}
            className={`${role == 3 ? "hidden" : ""} mb-4 bg-green-500 text-white p-2 rounded`} // KEEPING ORIGINAL CLASS
          >
            اضافه کردن لیست درآمد
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
                onChange={handleChange}
                required
                className="shadow appearance-none border bg-white rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="" disabled>
                  انتخاب ماه
                </option>
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {" "}
                    {m.label}{" "}
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
                onChange={handleChange}
                min={currentYear - 5}
                max={currentYear + 5}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-white focus:outline-none focus:shadow-outline"
              />
            </div>
            {/* Source Input - KEEPING ORIGINAL CLASSES */}
            <div className="mb-4">
              <label
                htmlFor="source"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                {" "}
                منبع:{" "}
              </label>
              <input
                type="text"
                id="source"
                name="source"
                value={formData.source}
                onChange={handleChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-white focus:outline-none focus:shadow-outline"
                placeholder="منبع درآمد"
              />
            </div>
            {/* Amount Input - KEEPING ORIGINAL CLASSES */}
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
                placeholder="مقدار"
              />
            </div>
            {/* Description Input - KEEPING ORIGINAL CLASSES */}
            <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                {" "}
                توضیحات:{" "}
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-white focus:outline-none focus:shadow-outline"
                placeholder="توضیحات"
              />
            </div>
            {/* Receiver Input - KEEPING ORIGINAL CLASSES */}
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
                placeholder="دریافت کننده"
              />
            </div>
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
      <FilterIncomes
        filterYear={filterYear}
        setFilterYear={setFilterYear}
        filterMonth={filterMonth}
        setFilterMonth={setFilterMonth}
        years={years}
        months={months}
      />
      <div className="bg-white rounded-t-md shadow-lg overflow-hidden overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-primary text-white text-md font-semibold uppercase tracking-wider">
              <th className="border border-gray-300 py-3 px-4">ماه</th>
              <th className="border border-gray-300 py-3 px-4">سال</th>
              <th className="border border-gray-300 py-3 px-4">منبع</th>
              <th className="border border-gray-300 py-3 px-4">مقدار</th>
              <th className="border border-gray-300 py-3 px-4">توضیحات</th>
              <th className="border border-gray-300 py-3 px-4">دریافت کننده</th>
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
            {currentIncomes.map((income) => (
              <tr
                key={income.id}
                className="border-b border-gray-500 text-center hover:bg-gray-100 transition-colors duration-300"
              >
                <td className="px-5 py-3">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {getMonthLabel(income.month)}
                  </p>
                </td>
                <td className="px-5 py-3">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {income.year}
                  </p>
                </td>
                <td className="px-5 py-3">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {income.source}
                  </p>
                </td>
                <td className="px-5 py-3">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {income.amount?.toLocaleString() || "-"}
                  </p>
                </td>
                <td className="px-5 py-3">
                  <p
                    className="text-gray-900 whitespace-no-wrap cursor-pointer"
                    onClick={() => toggleDescription(income.id)}
                    title={
                      expandedDescriptionId === income.id ? "" : "نمایش کامل"
                    }
                  >
                    {expandedDescriptionId === income.id
                      ? income.description
                      : truncateDescription(income.description, 20)}
                  </p>
                </td>
                <td className="px-5 py-3">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {income.receiver}
                  </p>
                </td>
                <td className={`${role == 3 ? "hidden" : ""} px-5 py-3`}>
                  <div className="flex justify-center items-center gap-3">
                    <button
                      onClick={() => handleEdit(income)}
                      className="text-blue-600 hover:text-blue-800 transition-all cursor-pointer duration-300 transform hover:scale-110"
                      title="ویرایش"
                    >
                      <FaRegEdit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(income.id)}
                      className="text-red-600 hover:text-red-800 transition-all cursor-pointer transform duration-300 hover:scale-110"
                      title="حذف"
                    >
                      <MdDeleteForever size={24} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {/* No results message */}
            {filteredIncomes.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  {incomes.length === 0
                    ? "هیچ درآمدی ثبت نشده است."
                    : "موردی با فیلترهای انتخابی یافت نشد."}
                </td>
              </tr>
            )}

            {/* Total row */}
            {filteredIncomes.length > 0 && (
              <tr className="bg-gray-100 font-bold text-center">
                <td colSpan="3" className="py-3 px-4">
                  مجموع کل
                </td>
                <td className="py-3 px-4 text-blue-700">
                  {filteredIncomes
                    .reduce(
                      (sum, item) => sum + (parseFloat(item.amount) || 0),
                      0
                    )
                    .toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </td>
                <td colSpan="3"></td>
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
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed" // KEEPING ORIGINAL CLASS
          >
            قبلی
          </button>
          {renderPageNumbers()} {/* Uses original button classes */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pageCount}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed" // KEEPING ORIGINAL CLASS
          >
            بعدی
          </button>
        </div>
      )}
    </div>
  );
};

export default Incomes;
