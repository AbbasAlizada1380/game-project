import React from "react";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { floors } from "../ServiceManager/Hook/rentConstant";

const AgreementTable = ({
  agreements = [],
  customers = [],
  onEdit,
  onDelete,
  disabled = false,
}) => {
  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : "نامشخص"; // "Unknown"
  };

  const formatShop = (shopData) => {
    if (Array.isArray(shopData)) {
      return shopData.join(", ");
    }
    return shopData || "-";
  };

  const formatFloor = (floorValue) => {
    if (floorValue === null || floorValue === undefined || floorValue === "") {
      return "-";
    }

    const floorNumber = parseInt(floorValue, 10);

    if (isNaN(floorNumber)) {
      return floorValue;
    }

    switch (floorNumber) {
      case 0:
        return "زیرزمین"; // Ground Floor
      case 1:
        return "طبقه اول"; // First Floor
      case 2:
        return "طبقه دوم"; // Second Floor
      case 3:
        return "طبقه سوم"; // Third Floor
      case 4:
        return "طبقه چهارم"; // Fourth Floor
      case 5:
        return "طبقه پنجم"; // Fifth Floor
      default:
        return `طبقه ${floorNumber}`; // Or return String(floorValue); or "-"
    }
  };

  if (agreements.length === 0) {
    return null;
  }

  return (
    <div className="shadow border-b border-gray-200 sm:rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        {/* Original thead style */}
        <thead className="bg-gray-100">
          <tr className="text-right  bg-primary text-xs font-medium text-gray-100 uppercase tracking-wider rtl:text-right">
            <th scope="col" className="px-6 py-3 border-l border-gray-300">
              دوکاندار
            </th>
            <th scope="col" className="px-6 py-3 border-l border-gray-300">
              وضعیت
            </th>
            <th scope="col" className="px-6 py-3 border-l border-gray-300">
              دکان
            </th>
            <th scope="col" className="px-6 py-3 border-l border-gray-300">
              کرایه
            </th>
            <th scope="col" className="px-6 py-3 border-l border-gray-300">
              خدمات
            </th>
            <th scope="col" className="px-6 py-3 border-l border-gray-300">
              منزل
            </th>
            <th scope="col" className="px-6 py-3 border-l border-gray-300">
              پیش پرداخت
            </th>
            <th scope="col" className="px-6 py-3 text-center">
              عملیات
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {agreements.map((agreement) => (
            <tr
              key={agreement.id}
              className="hover:bg-gray-50 transition-colors duration-150 ease-in-out text-right rtl:text-right"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-l border-gray-200">
                {getCustomerName(agreement.customer)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-l border-gray-200">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    agreement.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {agreement.status === "Active" ? "فعال" : "غیرفعال"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-l border-gray-200">
                {formatShop(agreement.shop)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-l border-gray-200">
                {agreement.rant ?? "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-l border-gray-200">
                {agreement.service ?? "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-l border-gray-200">
                {floors.find((floor)=>floor.value==agreement.floor)?.label}
              </td>
              {/* --- --- */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-l border-gray-200">
                {agreement.advance ?? "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                <div className="flex justify-center items-center space-x-3 rtl:space-x-reverse">
                  <button
                    onClick={() => onEdit(agreement)}
                    disabled={disabled}
                    title="ویرایش"
                    className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out"
                  >
                    <FaRegEdit size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(agreement.id)}
                    disabled={disabled}
                    title="حذف"
                    className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out"
                  >
                    <MdDeleteForever size={20} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AgreementTable;
