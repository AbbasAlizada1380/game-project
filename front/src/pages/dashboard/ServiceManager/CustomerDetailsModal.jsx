import React from "react";
//import { shamsiMonths } from "../../../utils/dateConvert"; // Ensure correct relative path

function CustomerDetailsModal({
  customerServiceDetails,
  customersInfo,
  selectedCustomer,
  selectedServiceYear,
  selectedServiceTime,
  onClose,
}) {
  if (!customerServiceDetails) return null;

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
  const monthName =
    shamsiMonths[parseInt(selectedServiceTime) - 1] || "Invalid Month";

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-400 bg-opacity-50 backdrop-blur-sm flex justify-center items-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-right">جزئیات مشتری</h2>
        <p>نام: {customersInfo[selectedCustomer]?.name}</p>
        <p>نام پدر: {customersInfo[selectedCustomer]?.father_name}</p>
        <p>سال سرویس: {selectedServiceYear}</p>
        <p>ماه سرویس: {monthName}</p>
        <p>سرویس: {customerServiceDetails.service}</p>
        <p>دریافتی: {customerServiceDetails.taken}</p>
        <p>مانده: {customerServiceDetails.remainder}</p>
        <p>تایید شده: {customerServiceDetails.is_approved ? "بله" : "خیر"}</p>
        <button
          onClick={onClose}
          className="bg-red-500 text-white px-4 py-2 rounded mt-4"
        >
          بستن
        </button>
      </div>
    </div>
  );
}

export default CustomerDetailsModal;
