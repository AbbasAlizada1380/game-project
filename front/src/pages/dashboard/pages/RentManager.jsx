import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import moment from "moment-jalaali";
import { useSelector } from "react-redux";
import { RentForm } from "../ServiceManager/Hook/rentForm";
import { floors, months } from "../ServiceManager/Hook/rentConstant"; // months is crucial here
import { Edit, Trash } from "lucide-react";
import CustomerDetailsTable from "../ServiceManager/customerDetailsTable";
import useYearMonth from "../pages/useYearMonth.jsx";
import FilterRants from "../../dashboard/pages/FilterRants"; // Corrected path based on typical structure
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function Rent() {
  const role = useSelector((state) => state.user.currentUser.role[0]);
  const [rants, setRants] = useState([]);
  const [selectedRant, setSelectedRant] = useState(null);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const { years: availableYears } = useYearMonth(
    String(moment().jYear()),
    months[0]?.label || ""
  );
  const [form, setForm] = useState({
    floor: floors[0]?.value !== undefined ? floors[0].value : 0,
    time: months[0]?.value !== undefined ? months[0].value : "",
    year: String(moment().jYear()),
    total: 0,
    customers_list: 0,
  });

  const [editingId, setEditingId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [filterYear, setFilterYear] = useState("");
  // --- MODIFIED: State for month range filtering ---
  const [filterStartMonth, setFilterStartMonth] = useState(""); // Stores the START Month LABEL
  const [filterEndMonth, setFilterEndMonth] = useState(""); // Stores the END Month LABEL
  // const [filterMonth, setFilterMonth] = useState(""); // OLD: This line is replaced

  const [filterFloor, setFilterFloor] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const years = useMemo(() => availableYears, [availableYears]);

  useEffect(() => {
    fetchRants();
  }, [isDetailModalOpen]);

  const fetchRants = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/rent/`);
      setRants(data);
    } catch (error) {
      toast.error("دریافت اطلاعات کرایه‌ها ناکام شد!");
      console.error("Error fetching rants:", error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/rent/${editingId}/`, form);
        toast.success("کرایه با موفقیت ویرایش شد.");
      } else {
        await axios.post(`${BASE_URL}/rent/`, form);
        toast.success("کرایه با موفقیت اضافه شد.");
      }
      setForm({
        floor: floors[0]?.value !== undefined ? floors[0].value : 0,
        time: months[0]?.value !== undefined ? months[0].value : "",
        year: String(moment().jYear()),
        total: 0,
        customers_list: 0,
      });
      setEditingId(null);
      setIsFormVisible(false);
      fetchRants();
    } catch (error) {
      const action = editingId ? "ویرایش" : "اضافه کردن";
      toast.error(`عملیات ${action} کرایه ناکام شد!`);
      console.error(
        "Error submitting rent:",
        error.response?.data || error.message
      );
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: "این عملیات غیرقابل بازگشت است!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "بله، حذف شود",
      cancelButtonText: "لغو",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/rent/${id}/`);
        toast.success("رکورد مورد نظر با موفقیت حذف شد.");
        fetchRants();
        if (selectedRant && selectedRant.id === id) {
          setSelectedRant(null);
          setDetailModalOpen(false);
        }
      } catch (error) {
        toast.error("حذف رکورد ناکام شد!");
        console.error(
          "Error deleting rent:",
          error.response?.data || error.message
        );
      }
    }
  };

  const handleRowClick = (rant) => {
    setSelectedRant(rant);
    setDetailModalOpen(true);
  };

  const handleEdit = (rant) => {
    setForm({
      floor: rant.floor,
      time: rant.time,
      year: rant.year,
      total: rant.total || 0,
      customers_list: rant.customers_list || 0,
    });
    setEditingId(rant.id);
    setIsFormVisible(true);
  };

  const filteredRants = useMemo(() => {
    let filtered = [...rants];

    if (filterYear) {
      filtered = filtered.filter(
        (rant) => String(rant.year) === String(filterYear)
      );
    }

    // --- MODIFIED: Month Range Filtering Logic ---
    if (filterStartMonth && filterEndMonth) {
      const startMonthObject = months.find((m) => m.label === filterStartMonth);
      const endMonthObject = months.find((m) => m.label === filterEndMonth);

      if (startMonthObject && endMonthObject) {
        const startMonthValue = parseInt(startMonthObject.value, 10);
        const endMonthValue = parseInt(endMonthObject.value, 10);

        // Ensure values are valid numbers and startMonthValue <= endMonthValue
        // Example: "حمل" (1) to "حوت" (12) is valid.
        // If user selected "جوزا" (3) as start and "حمل" (1) as end, this condition (startMonthValue <= endMonthValue) would be false.
        // For simplicity, we only filter if the range is logically ordered within a year.
        if (
          !isNaN(startMonthValue) &&
          !isNaN(endMonthValue) &&
          startMonthValue <= endMonthValue
        ) {
          filtered = filtered.filter((rant) => {
            const rantMonthValue = parseInt(rant.time, 10); // rant.time is like "1", "2", ... "12"
            return (
              !isNaN(rantMonthValue) &&
              rantMonthValue >= startMonthValue &&
              rantMonthValue <= endMonthValue
            );
          });
        }
        // Optional: Add an 'else' here to handle startMonthValue > endMonthValue, e.g., show a warning or don't filter.
        // For now, it simply won't filter if the range is "inverted".
      }
    } else if (filterStartMonth) {
      // Optional: If only start month is selected, filter by it
      const startMonthObject = months.find((m) => m.label === filterStartMonth);
      if (startMonthObject) {
        filtered = filtered.filter(
          (rant) => String(rant.time) === String(startMonthObject.value)
        );
      }
    } else if (filterEndMonth) {
      // Optional: If only end month is selected, filter by it
      const endMonthObject = months.find((m) => m.label === filterEndMonth);
      if (endMonthObject) {
        filtered = filtered.filter(
          (rant) => String(rant.time) === String(endMonthObject.value)
        );
      }
    }
    // --- END OF MODIFIED Month Filtering Logic ---

    if (filterFloor) {
      filtered = filtered.filter(
        (rant) => String(rant.floor) === String(filterFloor)
      );
    }

    return filtered;
  }, [
    rants,
    filterYear,
    filterStartMonth,
    filterEndMonth,
    filterFloor,
    months,
  ]); // --- MODIFIED: Added filterStartMonth, filterEndMonth to dependencies, removed filterMonth

  useEffect(() => {
    setCurrentPage(1);
  }, [filterYear, filterStartMonth, filterEndMonth, filterFloor]); // --- MODIFIED: Added filterStartMonth, filterEndMonth to dependencies, removed filterMonth

  const pageCount = Math.ceil(filteredRants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRants = filteredRants.slice(startIndex, endIndex);

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
          className={`px-3 py-1 rounded-md mx-1 ${
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

  const totals = currentRants.reduce(
    (acc, rant) => {
      acc.total += parseFloat(rant.total) || 0;
      acc.total_taken += parseFloat(rant.total_taken) || 0;
      return acc;
    },
    { total: 0, total_taken: 0 }
  );
  totals.remaining = totals.total - totals.total_taken;

  const getFloorLabel = (value) =>
    floors.find((f) => String(f.value) === String(value))?.label ||
    `طبقه ${value}`;
  const getMonthLabel = (
    value // This function remains useful for displaying month names in the table
  ) =>
    months.find((m) => String(m.value) === String(value))?.label ||
    `ماه ${value}`;

  return (
    <div className="p-6 min-h-screen">
      <ToastContainer
        position="top-left"
        autoClose={4000}
        // ... other ToastContainer props
        rtl={true}
        theme="colored"
      />
      <div className="mx-auto">
        <h2 className="text-xl font-bold mb-4 text-center">مدیریت کرایه</h2>
        {!isFormVisible && (
          <div className="my-5 flex justify-center">
            <button
              onClick={() => {
                setEditingId(null);
                setForm({
                  floor: floors[0]?.value !== undefined ? floors[0].value : 0,
                  time: months[0]?.value !== undefined ? months[0].value : "",
                  year: String(moment().jYear()),
                  total: 0,
                  customers_list: 0,
                });
                setIsFormVisible(true);
              }}
              className={` ${role == 3 ? "hidden" : ""
                } mb-4 bg-green-500 cursor-pointer hover:bg-green-600 text-white p-2 rounded`}
            >
              اضافه کردن کرایه
            </button>
          </div>
        )}
        {isFormVisible && (
          <RentForm
            form={form}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            editingId={editingId}
            setIsFormVisible={setIsFormVisible}
          />
        )}
        <FilterRants
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
          months={months}
          floors={floors}
        />
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-t-md overflow-hidden shadow">
            <thead className="bg-gray-100">
              <tr className="bg-primary text-white text-md font-semibold uppercase tracking-wider">
                <th className="border border-gray-300 py-3 px-4">طبقه</th>
                <th className="border border-gray-300 py-3 px-4">سال</th>
                <th className="border border-gray-300 py-3 px-4">ماه</th>
                <th className="border border-gray-300 py-3 px-4">مجموعی</th>
                <th className="border border-gray-300 py-3 px-4">دریافتی</th>
                <th className="border border-gray-300 py-3 px-4">باقی</th>
                <th className={`${role == 3 ? "hidden" : ""
                  } border border-gray-300 py-3 px-4`}>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {currentRants.length > 0 ? (
                currentRants.map((rant) => (
                  <tr
                    key={rant.id}
                    className="border-b border-gray-300 text-center hover:bg-gray-100 transition-colors duration-200"
                  >
                    <td
                      onClick={() => handleRowClick(rant)}
                      className="p-3 cursor-pointer"
                    >
                      {getFloorLabel(rant.floor)}
                    </td>
                    <td
                      onClick={() => handleRowClick(rant)}
                      className="p-3 cursor-pointer"
                    >
                      {rant.year}
                    </td>
                    <td
                      onClick={() => handleRowClick(rant)}
                      className="p-3 cursor-pointer"
                    >
                      {getMonthLabel(rant.time)}{" "}
                      {/* Displays the single month name */}
                    </td>
                    <td
                      onClick={() => handleRowClick(rant)}
                      className="p-3 cursor-pointer"
                    >
                      {rant.total?.toLocaleString() ?? "0"}
                    </td>
                    <td
                      onClick={() => handleRowClick(rant)}
                      className="p-3 cursor-pointer"
                    >
                      {rant.total_taken?.toLocaleString() ?? "0"}
                    </td>
                    <td
                      onClick={() => handleRowClick(rant)}
                      className="p-3 cursor-pointer"
                    >
                      {(rant.total - rant.total_taken)?.toLocaleString() ?? "0"}
                    </td>
                    <td className={`${role == 3 ? "hidden" : ""
                      } p-2`}>
                      <div className="flex justify-center items-center gap-3">
                        <button
                          title="ویرایش"
                          onClick={() => handleEdit(rant)}
                          className="text-blue-600 hover:text-blue-800 transition-all duration-300 transform hover:scale-110"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          title="حذف"
                          onClick={() => handleDelete(rant.id)}
                          className="text-red-600 hover:text-red-800 transition-all transform duration-300 hover:scale-110"
                        >
                          <Trash size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-4 text-gray-500">
                    {rants.length === 0 &&
                    !filterYear &&
                    // --- MODIFIED: Condition for initial empty message ---
                    !filterStartMonth &&
                    !filterEndMonth &&
                    !filterFloor
                      ? "داده‌ای برای نمایش وجود ندارد."
                      : "هیچ رکوردی با فیلترهای انتخابی یافت نشد."}
                  </td>
                </tr>
              )}
            </tbody>
            {currentRants.length > 0 && (
              <tfoot className="bg-gray-50 font-semibold text-center text-gray-700">
                <tr>
                  <td
                    colSpan="3"
                    className="py-3 px-4 border border-t-2 border-gray-300"
                  >
                    جمع کل صفحه فعلی
                  </td>
                  <td className="py-3 px-4 border border-t-2 border-gray-300">
                    {totals.total.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 border border-t-2 border-gray-300">
                    {totals.total_taken.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 border border-t-2 border-gray-300">
                    {totals.remaining.toLocaleString()}
                  </td>
                  <td className={`${role == 3 ? "hidden" : ""
                    } py-3 px-4 border border-t-2 border-gray-300`}>
                    —
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        {pageCount > 1 && (
          <div className="flex justify-center items-center p-4 mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed ml-2"
            >
              قبلی
            </button>
            {renderPageNumbers()}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pageCount}
              className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed mr-2"
            >
              بعدی
            </button>
          </div>
        )}
      </div>
      {isDetailModalOpen && selectedRant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex justify-center items-center z-50">
          <div className="relative bg-white p-6 rounded-lg shadow-xl w-11/12 md:w-2/3 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-semibold text-gray-700">
                جزئیات رکورد
              </h2>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="text-red-500 hover:text-red-700 text-2xl font-bold"
                aria-label="بستن"
              >
                بستن
              </button>
            </div>
            <CustomerDetailsTable
              data={selectedRant}
              type="rent"
              setIsDetailModalOpen={setDetailModalOpen}
            />
          </div>
        </div>
      )}
    </div>
  );
}
