import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import moment from "moment-jalaali";
import { Edit, Trash, PlusCircle, XCircle } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Configure moment-jalaali
moment.loadPersian({ usePersianDigits: false, dialect: "persian-modern" });

// --- Configuration ---
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";
const API_ENDPOINT = `${BASE_URL}/units/finances/`;

// --- Date Formatting Helpers ---
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  return moment(dateString).format("YYYY-MM-DD");
};

const formatDateForDisplay = (dateString) => {
  if (!dateString) return "-";
  return moment(dateString).format("jYYYY/jMM/jDD");
};

// --- Constants for FORM 'to_person' options ---
const PREDEFINED_INDIVIDUAL_NAMES_FOR_FORM = ["استاد رحیم افضلی"];
const OTHER_CATEGORY_LABEL_FOR_FORM = "دیگران"; // Label for "Others" in the form dropdown
const ALL_UI_SELECT_OPTIONS_FOR_FORM_TO_PERSON = [
  ...PREDEFINED_INDIVIDUAL_NAMES_FOR_FORM,
  OTHER_CATEGORY_LABEL_FOR_FORM,
];
const DEFAULT_FORM_SELECTED_UI_CATEGORY =
  PREDEFINED_INDIVIDUAL_NAMES_FOR_FORM[0]; // Default UI selection for the form

// --- Initial Form State ---
const initialFormState = {
  form_person: "",
  to_person: DEFAULT_FORM_SELECTED_UI_CATEGORY, // `form.to_person` will hold the actual name
  amount: "",
  description: "",
  issue_date: formatDateForInput(new Date()),
};

// --- Constants for TABLE FILTER 'to_person' options ---
const TO_PERSON_TABLE_FILTER_OPTIONS = [
  { value: "", label: "همه گیرندگان" },
  { value: "حاجی عباس", label: "حاجی عباس" },
  { value: "حاجی پرورش", label: "حاجی پرورش" },
  { value: "دیگران", label: "دیگران" }, // Represents individuals not in PREDEFINED_INDIVIDUAL_NAMES_FOR_FORM
];

// --- Jalali Month & Year Constants ---
const jalaliMonthNames = [
  { value: "1", name: "حمل" },
  { value: "2", name: "ثور" },
  { value: "3", name: "جوزا" },
  { value: "4", name: "سرطان" },
  { value: "5", name: "اسد" },
  { value: "6", name: "سنبله" },
  { value: "7", name: "میزان" },
  { value: "8", name: "عقرب" },
  { value: "9", name: "قوس" },
  { value: "10", name: "جدی" },
  { value: "11", name: "دلو" },
  { value: "12", name: "حوت" },
];
const JALALI_YEAR_START = 1400;
const JALALI_YEAR_END = 1420;
const fixedJalaliYears = Array.from(
  { length: JALALI_YEAR_END - JALALI_YEAR_START + 1 },
  (_, i) => JALALI_YEAR_START + i
).sort((a, b) => b - a);

export default function FinanceComponent() {
  // const role = useSelector((state) => state.user.currentUser.role[0]);
  const [finances, setFinances] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Filter & Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [toPersonTableFilter, setToPersonTableFilter] = useState(""); // For the table filter

  // State for the FORM's 'to_person' select and custom input
  const [
    selectedToPersonUiCategoryForForm,
    setSelectedToPersonUiCategoryForForm,
  ] = useState(DEFAULT_FORM_SELECTED_UI_CATEGORY);
  const [customToPersonNameForForm, setCustomToPersonNameForForm] =
    useState("");

  useEffect(() => {
    fetchFinances();
  }, []);

  // Effect to synchronize `form.to_person` with the FORM's select/custom input
  useEffect(() => {
    if (selectedToPersonUiCategoryForForm === OTHER_CATEGORY_LABEL_FOR_FORM) {
      setForm((prevForm) => ({
        ...prevForm,
        to_person: customToPersonNameForForm.trim(),
      }));
    } else {
      setForm((prevForm) => ({
        ...prevForm,
        to_person: selectedToPersonUiCategoryForForm,
      }));
    }
  }, [selectedToPersonUiCategoryForForm, customToPersonNameForForm]);

  const fetchFinances = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(API_ENDPOINT);
      setFinances(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("دریافت اطلاعات مالی ناموفق بود!");
      console.error("Error fetching finances:", error);
      setFinances([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFinances = useMemo(() => {
    let tempFinances = [...finances];

    // 1. General Search Term Filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      tempFinances = tempFinances.filter((finance) => {
        const formPersonMatch = finance.form_person
          ?.toLowerCase()
          .includes(searchLower);
        const toPersonMatch = finance.to_person
          ?.toLowerCase()
          .includes(searchLower);
        const descriptionMatch = finance.description
          ?.toLowerCase()
          .includes(searchLower);
        const amountMatch = String(finance.amount)
          .toLowerCase()
          .includes(searchLower);
        const dateMatch = formatDateForDisplay(finance.issue_date).includes(
          searchLower
        );
        return (
          formPersonMatch ||
          toPersonMatch ||
          descriptionMatch ||
          amountMatch ||
          dateMatch
        );
      });
    }

    // 2. 'to_person' Specific Table Filter
    if (toPersonTableFilter) {
      if (toPersonTableFilter === "دیگران") {
        tempFinances = tempFinances.filter(
          (finance) =>
            !PREDEFINED_INDIVIDUAL_NAMES_FOR_FORM.includes(finance.to_person)
        );
      } else {
        // "حاجی عباس" or "حاجی پرورش"
        tempFinances = tempFinances.filter(
          (finance) => finance.to_person === toPersonTableFilter
        );
      }
    }

    // 3. Jalali Year Filter
    if (selectedYear) {
      tempFinances = tempFinances.filter(
        (finance) =>
          finance.issue_date &&
          moment(finance.issue_date).jYear() === parseInt(selectedYear)
      );
    }

    // 4. Jalali Month Filter
    if (selectedMonth) {
      tempFinances = tempFinances.filter(
        (finance) =>
          finance.issue_date &&
          moment(finance.issue_date).jMonth() + 1 === parseInt(selectedMonth)
      );
    }

    return tempFinances;
  }, [finances, searchTerm, selectedMonth, selectedYear, toPersonTableFilter]);

  // Reset current page when filters or search term change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedMonth, selectedYear, toPersonTableFilter]);

  // Generic handler for simple form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  // Handler for the FORM's 'to_person' select change
  const handleToPersonFormSelectChange = (e) => {
    const { value } = e.target;
    setSelectedToPersonUiCategoryForForm(value);
    if (value !== OTHER_CATEGORY_LABEL_FOR_FORM) {
      setCustomToPersonNameForForm(""); // Clear custom input if a predefined option is chosen
    }
  };

  // Handler for the FORM's custom 'to_person' input change
  const handleCustomToPersonFormInputChange = (e) => {
    setCustomToPersonNameForForm(e.target.value);
  };

  const resetFormAndHide = () => {
    setForm(initialFormState); // Resets form.to_person to default predefined
    setSelectedToPersonUiCategoryForForm(DEFAULT_FORM_SELECTED_UI_CATEGORY); // Reset UI select for form
    setCustomToPersonNameForForm(""); // Reset custom input text for form
    setEditingId(null);
    setIsFormVisible(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // `form.to_person` is already correctly set by the useEffect
    if (
      !form.form_person ||
      !form.to_person ||
      !form.amount ||
      !form.issue_date
    ) {
      toast.warn("لطفاً تمام فیلدهای ضروری (* دار) را پر کنید.");
      return;
    }
    if (
      selectedToPersonUiCategoryForForm === OTHER_CATEGORY_LABEL_FOR_FORM &&
      !customToPersonNameForForm.trim()
    ) {
      toast.warn("لطفاً نام گیرنده را برای گزینه 'دیگران' مشخص کنید.");
      return;
    }

    setIsLoading(true);
    // Backend expects Gregorian date, form.issue_date is already Gregorian
    const financeData = { ...form, amount: parseFloat(form.amount) || 0 };
    const url = editingId ? `${API_ENDPOINT}${editingId}/` : API_ENDPOINT;
    const method = editingId ? "put" : "post";
    const action = editingId ? "ویرایش" : "ثبت";
    const successMessage = `سند مالی با موفقیت ${action} شد.`;
    const errorMessage = `عملیات ${action} سند مالی ناموفق بود!`;

    try {
      await axios[method](url, financeData);
      toast.success(successMessage);
      resetFormAndHide();
      fetchFinances();
    } catch (error) {
      console.error(
        `Error ${action} finance:`,
        error.response?.data || error.message
      );
      const backendError = error.response?.data;
      let displayError = errorMessage;
      if (typeof backendError === "object" && backendError !== null) {
        displayError = Object.entries(backendError)
          .map(
            ([key, value]) =>
              `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
          )
          .join(" | ");
      } else if (typeof backendError === "string") {
        displayError = backendError;
      }
      toast.error(displayError || errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (finance) => {
    const currentToPersonValue = finance.to_person || "";

    // Set UI state for the form's 'to_person' field
    if (PREDEFINED_INDIVIDUAL_NAMES_FOR_FORM.includes(currentToPersonValue)) {
      setSelectedToPersonUiCategoryForForm(currentToPersonValue);
      setCustomToPersonNameForForm("");
    } else {
      setSelectedToPersonUiCategoryForForm(OTHER_CATEGORY_LABEL_FOR_FORM);
      setCustomToPersonNameForForm(currentToPersonValue);
    }

    // Set the rest of the form. `form.to_person` will be updated by the useEffect.
    setForm({
      form_person: finance.form_person || "",
      to_person: currentToPersonValue, // This will be correctly set by the useEffect shortly
      amount: finance.amount || "",
      description: finance.description || "",
      issue_date: formatDateForInput(finance.issue_date),
    });

    setEditingId(finance.id);
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: "این سند مالی حذف خواهد شد!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "بله، حذف کن",
      cancelButtonText: "لغو",
      customClass: {
        popup: "swal2-popup-rtl",
        htmlContainer: "swal2-html-container-rtl",
      },
    });
    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        await axios.delete(`${API_ENDPOINT}${id}/`);
        toast.success("سند مالی با موفقیت حذف شد.");
        fetchFinances();
        if (editingId === id) resetFormAndHide();
      } catch (error) {
        toast.error("حذف سند مالی ناموفق بود!");
        console.error(
          "Error deleting finance:",
          error.response?.data || error.message
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Pagination logic
  const pageCount = Math.ceil(filteredFinances.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFinances = filteredFinances.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    const newPage = Math.max(1, Math.min(pageNumber, pageCount || 1));
    setCurrentPage(newPage);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= pageCount; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md mx-1 transition-colors duration-200 ${
            currentPage === i
              ? "bg-green-600 text-white font-semibold"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
          aria-current={currentPage === i ? "page" : undefined}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };
  const totalAmount = filteredFinances.reduce(
    (sum, item) => sum + parseFloat(item.amount || 0),
    0
  );

  return (
    <div className="p-6 min-h-screen bg-gray-50">
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
      <div className="max-w-8xl mx-auto">
        <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
          مدیریت اسناد مالی
        </h2>

        {!isFormVisible && (
          <div className="my-5 flex justify-center">
            <button
              onClick={() => {
                resetFormAndHide();
                setIsFormVisible(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`  mb-4 bg-green-500 cursor-pointer hover:bg-green-600 text-white p-2 rounded shadow flex items-center gap-1`}
              disabled={isLoading}
            >
              <PlusCircle size={20} /> افزودن سند مالی
            </button>
          </div>
        )}

        {isFormVisible && (
          <div className="bg-gray-200 p-6 rounded-lg shadow-md mb-8 border border-gray-200">
            <form onSubmit={handleSubmit}>
              <h3 className="text-xl font-semibold mb-4 text-right text-gray-700 border-b pb-2">
                {editingId ? "ویرایش سند مالی" : "افزودن سند مالی"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="form_person"
                    className="block text-right text-sm font-medium text-gray-700 mb-1"
                  >
                    تحویل دهنده <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="form_person"
                    name="form_person"
                    value={form.form_person}
                    onChange={handleChange}
                    required
                    className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="to_person_form_select"
                    className="block text-right text-sm font-medium text-gray-700 mb-1"
                  >
                    گیرنده <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="to_person_form_select"
                    name="to_person_form_select"
                    value={selectedToPersonUiCategoryForForm}
                    onChange={handleToPersonFormSelectChange}
                    required
                    className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right text-sm"
                  >
                    {ALL_UI_SELECT_OPTIONS_FOR_FORM_TO_PERSON.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {selectedToPersonUiCategoryForForm ===
                    OTHER_CATEGORY_LABEL_FOR_FORM && (
                    <input
                      type="text"
                      id="custom_to_person_form_input"
                      name="custom_to_person_form_input"
                      placeholder="نام گیرنده دیگر را وارد کنید"
                      value={customToPersonNameForForm}
                      onChange={handleCustomToPersonFormInputChange}
                      required
                      className="mt-2 shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right text-sm"
                    />
                  )}
                </div>
                <div>
                  <label
                    htmlFor="amount"
                    className="block text-right text-sm font-medium text-gray-700 mb-1"
                  >
                    مبلغ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="issue_date"
                    className="block text-right text-sm font-medium text-gray-700 mb-1"
                  >
                    تاریخ صدور <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="issue_date"
                    name="issue_date"
                    value={form.issue_date}
                    onChange={handleChange}
                    required
                    className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right text-sm"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="block text-right text-sm font-medium text-gray-700 mb-1"
                >
                  توضیحات
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  value={form.description}
                  onChange={handleChange}
                  className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right text-sm"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetFormAndHide}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-md shadow-sm transition duration-150 ease-in-out flex items-center gap-1"
                  disabled={isLoading}
                >
                  <XCircle size={18} /> لغو
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2 ${
                    editingId
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  } text-white font-semibold rounded-md shadow transition duration-200 ease-in-out flex items-center gap-1 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm mr-1"></span>{" "}
                      در حال پردازش...
                    </>
                  ) : (
                    <>
                      {editingId ? (
                        <Edit size={18} />
                      ) : (
                        <PlusCircle size={18} />
                      )}{" "}
                      {editingId ? "ذخیره تغییرات" : "ثبت سند"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TABLE FILTERS UI */}
        <div className="my-6 flex flex-col md:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="جستجو کلی (شخص، مبلغ، تاریخ، توضیحات)..."
            className="flex-grow w-full md:w-auto p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-right"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
          <div className="flex gap-4 w-full md:w-auto">
            <select
              id="filter-to-person"
              value={toPersonTableFilter}
              onChange={(e) => setToPersonTableFilter(e.target.value)}
              disabled={isLoading || finances.length === 0}
              title="فیلتر بر اساس گیرنده"
              className="flex-1 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-right cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {TO_PERSON_TABLE_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              id="filter-month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              disabled={isLoading || finances.length === 0}
              title="فیلتر بر اساس ماه شمسی"
              className="flex-1 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-right cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">همه ماه‌ها</option>
              {jalaliMonthNames.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.name}
                </option>
              ))}
            </select>
            <select
              id="filter-year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              disabled={isLoading || finances.length === 0}
              title="فیلتر بر اساس سال شمسی"
              className="flex-1 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-right cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">همه سال‌ها</option>
              {fixedJalaliYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TABLE DISPLAY */}
        <div className="overflow-x-auto shadow-md rounded-lg mb-6">
          <table className="w-full bg-white text-sm text-gray-600">
            <thead className="bg-blue-950 text-white text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th scope="col" className="border border-gray-300 py-3 px-4">
                  تحویل دهنده
                </th>
                <th scope="col" className="border border-gray-300 py-3 px-4">
                  گیرنده
                </th>
                <th scope="col" className="border border-gray-300 py-3 px-4">
                  مبلغ
                </th>
                <th scope="col" className="border border-gray-300 py-3 px-4">
                  تاریخ صدور (شمسی)
                </th>
                <th scope="col" className="border border-gray-300 py-3 px-4">
                  توضیحات
                </th>
                <th
                  scope="col"
                  className={` border border-gray-300 py-3 px-4`}
                >
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan="6" className="text-center p-4 text-gray-500">
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>{" "}
                    در حال بارگذاری...
                  </td>
                </tr>
              )}

              {!isLoading && finances.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center p-4 text-gray-500 italic"
                  >
                    هیچ سند مالی برای نمایش وجود ندارد.
                  </td>
                </tr>
              )}

              {!isLoading &&
                finances.length > 0 &&
                filteredFinances.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center p-4 text-gray-500 italic"
                    >
                      هیچ سندی با معیارهای جستجو/فیلتر شما مطابقت ندارد.
                    </td>
                  </tr>
                )}

              {!isLoading &&
                currentFinances.map((finance) => (
                  <tr
                    key={finance.id}
                    className="border-b border-gray-300 text-center hover:bg-gray-100 transition-colors duration-200"
                  >
                    <td className="p-3 font-medium text-gray-900 whitespace-nowrap">
                      {finance.form_person}
                    </td>
                    <td className="p-3">{finance.to_person}</td>
                    <td className="p-3 font-semibold text-blue-600">
                      {parseFloat(finance.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-3">
                      {formatDateForDisplay(finance.issue_date)}
                    </td>
                    <td
                      className="p-3 max-w-xs truncate text-center"
                      title={finance.description}
                    >
                      {finance.description || "-"}
                    </td>
                    <td className={`${role == 3 ? "hidden" : ""} p-2`}>
                      <div className="flex justify-center items-center gap-3">
                        <button
                          title="ویرایش"
                          onClick={() => handleEdit(finance)}
                          className="text-blue-600 hover:text-blue-800 transition-all duration-300 transform hover:scale-110 focus:outline-none disabled:opacity-50"
                          disabled={isLoading}
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          title="حذف"
                          onClick={() => handleDelete(finance.id)}
                          className="text-red-600 hover:text-red-800 transition-all duration-300 transform hover:scale-110 focus:outline-none disabled:opacity-50"
                          disabled={isLoading}
                        >
                          <Trash size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {/* ✅ Total Row */}
              {!isLoading && currentFinances.length > 0 && (
                <tr className="bg-gray-100 font-bold text-center">
                  <td colSpan="2" className="py-3 px-4">
                    مجموع کلی
                  </td>
                  <td className="py-3 px-4 text-blue-700">
                    {filteredFinances
                      .reduce(
                        (sum, item) => sum + parseFloat(item.amount || 0),
                        0
                      )
                      .toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                  </td>
                  <td colSpan={role == 3 ? 3 : 4}></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION UI */}
        {pageCount > 1 && (
          <div className="flex justify-center items-center p-4 mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed ml-2"
            >
              قبلی
            </button>
            {renderPageNumbers()}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pageCount || isLoading}
              className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed mr-2"
            >
              بعدی
            </button>
          </div>
        )}

        <style>{`
            @keyframes spinner-border { to { transform: rotate(360deg); } }
            .spinner-border { display: inline-block; width: 1rem; height: 1rem; vertical-align: -0.125em; border: 0.15em solid currentColor; border-right-color: transparent; border-radius: 50%; animation: .75s linear infinite spinner-border; }
            .spinner-border-sm { width: 0.8rem; height: 0.8rem; border-width: 0.1em; }
            .swal2-popup-rtl { direction: rtl !important; } 
            .swal2-html-container-rtl { text-align: right !important; }
            .bg-primary { background-color: #16a34a; /* Tailwind green-600 */ }
         `}</style>
      </div>
    </div>
  );
}
