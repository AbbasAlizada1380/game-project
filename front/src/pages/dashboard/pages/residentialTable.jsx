import React, { useState, useEffect } from "react";
import { Trash, Edit } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";

function ResidentialTable({ setEditData }) {
  const fallbackData = [
    {
      id: 1,
      name: "احمد",
      fatherName: "علی",
      services: 500,
      unitCount: 3,
      status: "فعال",
      waterMeter: "12345",
      electricityMeter: "67890",
    },
    {
      id: 2,
      name: "فاطمه",
      fatherName: "حسین",
      services: 1000,
      unitCount: 2,
      status: "غیرفعال",
      waterMeter: "54321",
      electricityMeter: "09876",
    },
  ];

  const [residentials, setResidentials] = useState([]);
  const [usingFallback, setUsingFallback] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchResidentials();
  }, []);

  const fetchResidentials = async () => {
    try {
      const response = await axios.get("http://your-base-url/residential");
      setResidentials(response.data);
    } catch (error) {
      console.error("خطا در دریافت اطلاعات، استفاده از داده آزمایشی", error);
      setResidentials(fallbackData);
      setUsingFallback(true);
    }
  };

  const deleteResidential = async (id) => {
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
      try {
        await axios.delete(`http://your-base-url/residential/${id}`);
        fetchResidentials();
      } catch (error) {
        console.error("خطا در حذف اطلاعات", error);
      }
    }
  };

  const currentItems = residentials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pageCount = Math.ceil(residentials.length / itemsPerPage);
  const renderPageNumbers = () =>
    Array.from({ length: pageCount }, (_, i) => (
      <button
        key={i + 1}
        onClick={() => setCurrentPage(i + 1)}
        className={`px-3 py-1 rounded-md ${
          currentPage === i + 1
            ? "bg-blue-600 text-white"
            : "bg-gray-200 hover:bg-gray-300"
        }`}
      >
        {i + 1}
      </button>
    ));

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow">
      {usingFallback && (
        <div className="bg-yellow-100 text-yellow-800 p-2 text-center text-sm">
          اطلاعات از سرور دریافت نشد، داده آزمایشی نمایش داده می‌شود.
        </div>
      )}
      <table className="w-full text-center">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="p-2">نام</th>
            <th className="p-2">نام پدر</th>
            <th className="p-2">خدمات</th>
            <th className="p-2">نمبر واحد</th>
            <th className="p-2">وضعیت</th>
            <th className="p-2">کنتور آب</th>
            <th className="p-2">کنتور برق</th>
            <th className="p-2">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item) => (
            <tr key={item.id} className="hover:bg-gray-100">
              <td className="p-2">{item.name}</td>
              <td className="p-2">{item.fatherName}</td>
              <td className="p-2">{item.services}</td>
              <td className="p-2">{item.unitCount}</td>
              <td className="p-2">{item.status}</td>
              <td className="p-2">{item.waterMeter}</td>
              <td className="p-2">{item.electricityMeter}</td>
              <td className="p-2 flex justify-center gap-2">
                <button
                  onClick={() => setEditData(item)}
                  className="text-green-600 hover:text-green-700"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => deleteResidential(item.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {pageCount > 1 && (
        <div className="flex justify-center gap-2 p-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            قبلی
          </button>
          {renderPageNumbers()}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, pageCount))}
            disabled={currentPage === pageCount}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            بعدی
          </button>
        </div>
      )}
    </div>
  );
}

export default ResidentialTable;
