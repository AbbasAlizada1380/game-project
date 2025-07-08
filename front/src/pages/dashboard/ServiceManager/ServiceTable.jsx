import React, { useState, useEffect } from "react";
import { Trash, Edit } from "lucide-react";
import Swal from "sweetalert2";
import CustomerDetailsTable from "./customerDetailsTable";
import { floors } from "./Hook/rentConstant";
import { useSelector } from "react-redux";

const shamsiMonths = [
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

function ServiceTable({
  setIsDetailFormOpen,
  services,
  editService,
  fetchServices,
  removeService,
  itemsPerPage = 15,
}) {
  const role = useSelector((state) => state.user.currentUser.role[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRant, setSelectedRant] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [services]);

  const pageCount = Math.ceil(services.length / itemsPerPage);
  const currentServices = services.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRowClick = (rant) => {
    setSelectedRant(rant);
    setIsDetailModalOpen(true);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pageCount) {
      setCurrentPage(page);
    }
  };

  const renderPageNumbers = () =>
    Array.from({ length: pageCount }, (_, i) => (
      <button
        key={i + 1}
        onClick={() => handlePageChange(i + 1)}
        className={`px-3 py-1 rounded-md ${
          currentPage === i + 1
            ? "bg-green-600 text-white"
            : "bg-gray-100 hover:bg-gray-200"
        }`}
      >
        {i + 1}
      </button>
    ));

  // Calculate the totals for the current page
  const calculateTotals = () => {
    let total = 0;
    let totalTaken = 0;
    let remaining = 0;

    currentServices.forEach((service) => {
      total += service.total || 0;
      totalTaken += service.total_taken || 0;
      remaining += service.total - service.total_taken || 0;
    });

    return { total, totalTaken, remaining };
  };

  const { total, totalTaken, remaining } = calculateTotals();
  const totalOverall = services.reduce(
    (acc, cur) => {
      return {
        total: acc.total + Number(cur.total),
        totalTaken: acc.totalTaken + Number(cur.total_taken),
      };
    },
    { total: 0, totalTaken: 0 }
  );

  return (
    <div className="bg-white rounded-t-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-primary text-white text-md font-semibold uppercase">
          <tr>
            <th className="border px-4 py-3">طبقه</th>
            <th className="border px-4 py-3">سال</th>
            <th className="border px-4 py-3">ماه</th>
            <th className="border px-4 py-3">مجموعه</th>
            <th className="border px-4 py-3">دریافتی</th>
            <th className="border px-4 py-3">باقی</th>
            <th className={`${role == 3 ? "hidden" : ""} border px-4 py-3`}>
              {" "}
              عملیات
            </th>
          </tr>
        </thead>
        <tbody>
          {currentServices.map((service) => (
            <tr
              key={service.id}
              className="border-b border-gray-300 text-center hover:bg-gray-100 cursor-pointer"
            >
              <td onClick={() => handleRowClick(service)} className="p-3">
                {floors.find((f) => f.value == service.floor)?.label || "—"}
              </td>
              <td onClick={() => handleRowClick(service)} className="p-3">
                {service.year}
              </td>
              <td onClick={() => handleRowClick(service)} className="p-3">
                {shamsiMonths[parseInt(service.time) - 1] || "نامشخص"}
              </td>
              <td onClick={() => handleRowClick(service)} className="p-3">
                {service.total}
              </td>
              <td onClick={() => handleRowClick(service)} className="p-3">
                {service.total_taken}
              </td>
              <td onClick={() => handleRowClick(service)} className="p-3">
                {service.total - service.total_taken}
              </td>
              <td className={`${role == 3 ? "hidden" : ""
                } p-3 flex justify-center gap-2`}>
                <button
                  onClick={() => editService(service)}
                  className="text-green-600 hover:text-green-700 transform hover:scale-110 transition"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={async () => {
                    const result = await Swal.fire({
                      title: "آیا مطمئن هستید؟",
                      text: "این عملیات قابل بازگشت نیست!",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonColor: "#d33",
                      cancelButtonColor: "#3085d6",
                      confirmButtonText: "بله، حذف شود!",
                      cancelButtonText: "لغو",
                    });
                    if (result.isConfirmed) {
                      removeService(service.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-700 transform hover:scale-110 transition"
                >
                  <Trash className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-100 font-semibold text-center">
          <tr>
            <td colSpan="3" className="p-3">
              مجموع
            </td>
            <td className="p-3">{totalOverall.total}</td>
            <td className="p-3">{totalOverall.totalTaken}</td>
            <td className="p-3">
              {totalOverall.total - totalOverall.totalTaken}
            </td>
            <td className={`${role == 3 ? "hidden" : ""
              } p-3`}>—</td>
          </tr>
        </tfoot>
      </table>

      {pageCount > 1 && (
        <div className="flex justify-center gap-2 p-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            قبلی
          </button>
          {renderPageNumbers()}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pageCount}
            className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            بعدی
          </button>
        </div>
      )}

      {isDetailModalOpen && selectedRant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-2/3 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">جزئیات پرداخت مشتریان</h2>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                بستن
              </button>
            </div>
            <CustomerDetailsTable
              setIsDetailFormOpen={setIsDetailFormOpen}
              setIsDetailModalOpen={setIsDetailModalOpen}
              data={selectedRant}
              type="service"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceTable;
