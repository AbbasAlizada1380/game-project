import React from "react";
import moment from "moment-jalaali";
import {
  FaInstagram,
  FaFacebook,
  FaPhone,
  FaTimes,
  FaPrint,
} from "react-icons/fa";
import { useSelector } from "react-redux";

const PrintBillModal = ({
  isOpen,
  onClose,
  customerData,
  companyInfo,
  type, 
}) => {
  const defaults = {
    name: " مرکز تجارتی حسین زاده سیتی سنتر",
    address: " آدرس: دشت برچی، گولای مهتاب قلعه ناحیه 6",
    logo: "/logo.png", // Ensure this path is correct from the public folder
    instagram: "hussain.zada.city.center",
    facebook: "hussain zada city center",
    note: "  هر دکاندار/کارمند مکلف است تا سه روز پس از توزیع بل، وضعیت پرداخت خود را مشخص نماید. در صورت تأخیر در پرداخت کرایه، ۱۰٪ جریمه به مبلغ اضافه می‌شود. در صورت عدم رعایت قوانین ذکر شده، اقدامات لازم طبق قرارداد صورت خواهد گرفت.",
    contactPerson1: "حمزه قاسمی (مدیر مسؤول)",
    contactNumber1: "93729502724+",
    contactPerson2: "مهدی یاوری (مدیر مالی)",
    contactNumber2: "93799508730+",
    email: "info@hzcitycente.com",
  };
  
  const role = useSelector((state) => state.user.currentUser.role[0]);
  const currentCompanyInfo = { ...defaults, ...companyInfo };
  
  if (!isOpen || !customerData) return null;

  const handlePrint = () => window.print();

  const todayJalali = moment().format("jYYYY/jMM/jDD");

  const billNumber =
    customerData.billNumber ||
    `BILL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const formatCurrency = (amount) =>
    (amount ?? 0).toLocaleString("fa-AF", {
      // fa-AF for Afghan Afghani
      style: "currency",
      currency: "AFN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  const formatNumber = (
    amount // For non-currency numbers like meter readings
  ) =>
    (amount ?? 0).toLocaleString("fa-AF", {
      // Using fa-AF for consistency if needed, or 'en-US'
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false, // Typically false for meter readings unless very large
    });

  // Determine type
  const isUnit = type === "unit";
  const isRent = type === "rent";
  const isService = type === "service";
  const isSalary = type === "salary"; // Added salary type

  let totalDue = 0;
  if (isUnit) {
    totalDue =
      (customerData.service_charge ?? 0) +
      (customerData.water_price ?? 0) +
      (customerData.electricity_price ?? 0);
  } else if (isSalary) {
    totalDue = customerData.totalAmount_Salary ?? 0; // Use the specific field for salary total
  } else if (isRent || isService) {
    totalDue = customerData.totalAmount_RentService ?? 0; // Use specific field for rent/service total
  }


  const takenAmount = customerData.taken ?? 0;
  const remainderAmount = customerData.remainder ?? 0; // This should be pre-calculated and passed

  const billPeriod =
    customerData.billMonth && customerData.billYear
      ? `(${customerData.billMonth} ${customerData.billYear})`
      : "";

  let paymentDetailsTitle = "جزئیات پرداخت";
  if (isRent) paymentDetailsTitle += ` کرایه ${billPeriod}`;
  else if (isService) paymentDetailsTitle += ` خدمات ${billPeriod}`;
  else if (isUnit) paymentDetailsTitle = `جزئیات بل واحد ${billPeriod}`;
  else if (isSalary) paymentDetailsTitle = `جزئیات معاش ${billPeriod}`; // Title for salary

  const payerSectionTitle = isUnit
    ? "مشخصات ساکن واحد"
    : isSalary
    ? "مشخصات کارمند"
    : "مشخصات پرداخت کننده";
  const nameLabel = isUnit ? "ساکن:" : isSalary ? "کارمند:" : "نام:";
  const shopLabel = isUnit
    ? "شماره واحد:"
    : isSalary
    ? "کد کارمندی:" // Or "شناسه کارمند"
    : "شماره دوکان:";

  // Floor label only for rent/service
  const floorLabel = isRent || isService ? "طبقه" : "";
  const remainderLabel = isUnit
    ? "باقیمانده از این بل:"
    : isSalary
    ? "باقیمانده معاش:"
    : "باقیمانده:";

  return (
    <div className="fixed inset-0 bg-gray-800/50 flex justify-center items-center z-50 print:bg-transparent print:p-0 print:items-start print:fixed print:top-0 print:left-0 print:w-full print:h-full backdrop-blur-sm">
      <div
        id="printable-area"
        className="bg-white shadow-xl w-[148mm] h-[210mm] overflow-hidden relative print:shadow-none print:w-full print:h-full print:border print:border-gray-300"
        style={{ direction: "rtl" }}
      >
        {/* Watermark */}
        <div className="absolute inset-0 overflow-hidden opacity-10 print:opacity-15 z-0 pointer-events-none">
          <img
            src={currentCompanyInfo.logo}
            alt="Watermark"
            className="w-full h-full object-contain object-center"
            onError={(e) => {
              e.target.style.display = "none"; // Hide if logo fails to load
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col px-1">
          {" "}
          {/* Reduced px-4 to px-1 or px-2 for A5 */}
          {/* Header */}
          <div className="mb-2 border-b-8 border-red-600">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3 flex items-center justify-between ">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <img
                  src={currentCompanyInfo.logo}
                  alt="Logo"
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
              <div className="flex flex-col items-center flex-grow">
                <h1 className="text-xl font-bold mb-1">
                  {" "}
                  {/* Consider text-lg for A5 */}
                  {currentCompanyInfo.name}
                </h1>
              </div>
              <div className="w-12 flex-shrink-0"></div> {/* Spacer */}
            </div>
          </div>
          {/* Bill Info */}
          <div className="flex justify-between text-xs sm:text-sm mb-4 bg-gray-100 p-2 rounded">
            {" "}
            {/* sm:text-sm might be too large for A5 */}
            <div>
              <span className="font-semibold">شماره سند:</span>{" "}
              <span className="font-mono mr-1">{billNumber}</span>
            </div>
            <div>
              <span className="font-semibold">تاریخ صدور:</span>{" "}
              <span className="mr-1">{todayJalali}</span>
            </div>
          </div>
          {/* Main Content Area */}
          <div className="flex-grow mb-4">
            {/* Payer Details */}
            <div className="mb-4 p-3 rounded border border-gray-200 ">
              <h3 className="text-sm font-semibold text-blue-800 mb-2 border-b pb-1">
                {" "}
                {/* text-xs or text-sm */}
                {payerSectionTitle}
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:text-sm pt-1">
                {" "}
                {/* text-xs */}
                <div>
                  <strong className="ml-1">{nameLabel}</strong>{" "}
                  {customerData.name || "______"}
                </div>
                {/* Father's Name (conditional) */}
                {customerData.customer_father_name && !isUnit && (
                  <div>
                    <strong className="ml-1">نام پدر:</strong>{" "}
                    {customerData.customer_father_name || "______"}
                  </div>
                )}
                {/* Shop/Unit/Staff ID (conditional) */}
                {(isRent || isService || isUnit) && customerData.shop && (
                  <div>
                    <strong className="ml-1">{shopLabel}</strong>{" "}
                    {customerData.shop || "______"}
                  </div>
                )}
                {isSalary && customerData.staff_identifier && (
                  <div>
                    <strong className="ml-1">{shopLabel}</strong>{" "}
                    {customerData.staff_identifier || "______"}
                  </div>
                )}
                {/* Floor (conditional) */}
                {(isRent || isService) && customerData.floor && (
                  <div>
                    <strong className="ml-1">{floorLabel}</strong>{" "}
                    {customerData.floor || "______"}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Details */}
            <div className="p-3 rounded border border-gray-200 ">
              <h3 className="text-sm font-semibold text-green-800 mb-2 border-b pb-1">
                {" "}
                {/* text-xs or text-sm */}
                {paymentDetailsTitle}
              </h3>
              <div className="space-y-2 text-xs sm:text-sm pt-1">
                {" "}
                {/* text-xs */}
                {/* Unit Specific Details */}
                {isUnit && (
                  <>
                    <div className="mb-2 pb-2 border-b border-dashed">
                      <h4 className="text-xs font-semibold text-gray-700 mb-1">
                        {" "}
                        {/* text-[10px] or text-xs */}
                        جزئیات مصرف
                      </h4>
                      <div className="grid grid-cols-4 gap-x-2 gap-y-1 text-[10px] sm:text-xs">
                        {" "}
                        {/* text-[10px] */}
                        <span>آب قبلی:</span>{" "}
                        <span className="font-mono font-bold ">
                          {formatNumber(customerData.previous_waterMeter)}
                        </span>
                        <span>آب فعلی:</span>{" "}
                        <span className="font-mono font-bold ">
                          {formatNumber(customerData.current_waterMeter)}
                        </span>
                        <span>برق قبلی:</span>
                        <span className="font-mono font-bold ">
                          {formatNumber(customerData.previous_electricityMeter)}
                        </span>
                        <span>برق فعلی:</span>
                        <span className="font-mono font-bold ">
                          {formatNumber(customerData.current_electricityMeter)}
                        </span>
                      </div>
                    </div>
                    <div className="mb-2 pb-2 border-b border-dashed">
                      <h4 className="text-xs font-semibold text-gray-700 mb-1">
                        {" "}
                        {/* text-[10px] or text-xs */}
                        هزینه ها
                      </h4>
                      <div className="flex justify-between">
                        <span>خدمات عمومی:</span>{" "}
                        <span>
                          {formatCurrency(customerData.service_charge)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>هزینه آب:</span>{" "}
                        <span>{formatCurrency(customerData.water_price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>هزینه برق:</span>{" "}
                        <span>
                          {formatCurrency(customerData.electricity_price)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
                {/* Totals Section */}
                <div className="pt-2 border-t border-gray-300">
                  <div className="flex justify-between font-bold text-sm sm:text-base mb-1">
                    {" "}
                    {/* text-sm */}
                    <span>
                      مبلغ کل{" "}
                      {isSalary ? "معاش" : isUnit ? "قابل پرداخت" : "بدهی"}:
                    </span>
                    <span className="text-red-600">
                      {formatCurrency(totalDue)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-dashed pb-1">
                    <span>مبلغ پرداخت شده:</span>
                    <span className="font-semibold">
                      {formatCurrency(takenAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{remainderLabel}</span>
                    <span className="font-semibold">
                      {formatCurrency(remainderAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="mt-auto border-t border-gray-300 pt-3">
            {/* Signatures */}
            <div className="flex justify-around text-xs text-center mb-3">
              {" "}
              {/* text-[10px] or text-xs */}
              <div className="border-t-2 border-dashed w-32 pt-1 mt-4">
                امضاء و شصت {isSalary ? "کارمند" : "پرداخت کننده"}
              </div>
              <div className="border-t-2 border-dashed w-32 pt-1 mt-4">
                مهر و امضاء مدیریت مارکیت
              </div>
            </div>
            {/* Contact Info & Note */}
            <div className="text-center border-t border-gray-200 pt-2 pb-2">
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs mb-2">
                {" "}
                {/* text-[10px] */}
                <div className="flex items-center">
                  <FaInstagram className="ml-1 text-pink-600" />
                  <span>{currentCompanyInfo.instagram}</span>
                </div>
                <div className="flex items-center">
                  <FaFacebook className="ml-1 text-blue-600" />
                  <span>{currentCompanyInfo.facebook}</span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs mb-2">
                {" "}
                {/* text-[10px] */}
                <div className="flex items-center">
                  <FaPhone className="ml-1 text-green-600" />
                  <span>
                    {currentCompanyInfo.contactPerson1}:{" "}
                    {currentCompanyInfo.contactNumber1}
                  </span>
                </div>
                <div className="flex items-center">
                  <FaPhone className="ml-1 text-green-600" />
                  <span>
                    {currentCompanyInfo.contactPerson2}:{" "}
                    {currentCompanyInfo.contactNumber2}
                  </span>
                </div>
              </div>
              <div className="text-[10px] sm:text-xs px-2 bg-yellow-50 rounded-lg border border-yellow-100">
                {" "}
                {/* text-[9px] or text-[10px] */}
                <strong className="ml-1">یادداشت:</strong>
                {currentCompanyInfo.note}
              </div>
            </div>
            {/* Bottom Address Bar */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center py-2 text-xs rounded-b-lg shadow-inner">
              {" "}
              {/* text-[10px] or text-xs */}
              <div>{currentCompanyInfo.address}</div>
              <div>ایمیل: {currentCompanyInfo.email}</div>
            </div>
          </div>
        </div>

        {/* Global Styles for Printing (same as before) */}
        <style jsx global>{`
          @media print {
            @page {
              size: A5 portrait; /* Standard A5 size */
              margin: 8mm; /* Adjust margin as needed */
            }
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              background: white !important;
              margin: 0;
              padding: 0;
              font-size: 9pt; /* Adjusted base font size for A5 */
            }
            #printable-area {
              width: 100% !important;
              height: 100% !important;
              box-shadow: none !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              overflow: hidden;
            }
            .bg-gray-100 {
              background-color: #f3f4f6 !important;
            }
            .bg-gray-50 {
              background-color: #f9fafb !important;
            }
            .bg-primary {
              background-color: #3b82f6 !important;
            } /* Assuming primary is blue */
            .text-primary {
              color: #3b82f6 !important;
            }
            .text-blue-800 {
              color: #1e40af !important;
            }
            .text-green-800 {
              color: #059669 !important;
            } /* Adjusted green for visibility */
            .text-red-600 {
              color: #dc2626 !important;
            }
            .text-pink-600 {
              color: #db2777 !important;
            }
            .text-gray-600 {
              color: #4b5563 !important;
            }
            .text-gray-700 {
              color: #374151 !important;
            }
            .text-white {
              color: #ffffff !important;
            }
            .border,
            .border-b,
            .border-t,
            .border-b-8 {
              border-color: #e5e7eb !important;
            }
            .border-gray-300 {
              border-color: #d1d5db !important;
            }
            .border-red-600 {
              border-color: #dc2626 !important;
            }
            .border-dashed {
              border-style: dashed !important;
            }
            .print\\:hidden {
              display: none !important;
            }

            /* Adjusting font sizes for A5 if needed */
            h1 {
              font-size: 12pt !important;
            }
            h3 {
              font-size: 9pt !important;
            }
            h4 {
              font-size: 8pt !important;
            }
            .text-xl {
              font-size: 12pt !important;
            }
            .text-lg {
              font-size: 11pt !important;
            }
            .text-sm {
              font-size: 8pt !important;
            }
            .text-xs {
              font-size: 7pt !important;
            }
            .text-\\[10px\\] {
              font-size: 6.5pt !important;
            } /* For very small text */

            /* Spacing adjustments for A5 might be needed here */
            .p-3 {
              padding: 0.5rem !important;
            }
            .p-2 {
              padding: 0.35rem !important;
            }
            .p-1 {
              padding: 0.2rem !important;
            }
            .mb-4 {
              margin-bottom: 0.75rem !important;
            }
            .mb-2 {
              margin-bottom: 0.35rem !important;
            }
            .py-2 {
              padding-top: 0.35rem !important;
              padding-bottom: 0.35rem !important;
            }
            .gap-x-4 {
              column-gap: 0.75rem !important;
            }
          }
        `}</style>
      </div>

      <div className="absolute bottom-5 left-5 print:hidden flex gap-3 z-20">
        <button
          onClick={onClose}
          className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center gap-2"
        >
          <FaTimes /> بستن
        </button>
        <button
          onClick={handlePrint}
          className={`${role == 3 ? "hidden" : ""} px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center gap-2`}
        >
          <FaPrint /> چاپ رسید
        </button>
      </div>
    </div>
  );
};

export default PrintBillModal;
