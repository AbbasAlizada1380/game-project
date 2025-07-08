// UnitBillDetails.js
import React, { useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import PrintBillModal from "../pages/PrintBillModal";
import { Printer } from "lucide-react";
import { useSelector } from "react-redux";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";

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

const safeParseFloat = (value) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0.0 : parsed;
};

const formatDisplay = (num) =>
  num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const UnitBillDetails = ({ data, setIsUnitBillModalOpen }) => {
  const role = useSelector((state) => state.user.currentUser.role[0]);
  const [unitDetails, setUnitDetails] = useState(data.unit_details_list || {});
  const [isLoading, setIsLoading] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedUnitForPrint, setSelectedUnitForPrint] = useState(null);
  

  const handleInputChange = (unitId, value, field) => {
    setUnitDetails((prev) => {
      const currentUnitData = { ...(prev[unitId] || {}) };
      const updatedUnit = {
        ...currentUnitData,
        [field]: value,
      };

      return {
        ...prev,
        [unitId]: updatedUnit,
      };
    });
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const dataToSend = {};
      for (const unitId in unitDetails) {
        const detail = unitDetails[unitId];
        dataToSend[unitId] = {
          unit_id: detail.unit_id,
          service_charge: String(safeParseFloat(detail.services).toFixed(2)),
          total_water_price: String(safeParseFloat(detail.total_water_price).toFixed(2)),
          total_electricity: String(safeParseFloat(detail.total_electricity).toFixed(2)),
          taken: String(safeParseFloat(detail.taken).toFixed(2)),
          current_waterMeter: String(safeParseFloat(detail.current_waterMeter).toFixed(2)),
          previous_waterMeter: String(safeParseFloat(detail.previous_waterMeter).toFixed(2)),
          current_electricityMeter: String(safeParseFloat(detail.current_electricityMeter).toFixed(2)),
          previous_electricityMeter: String(safeParseFloat(detail.previous_electricityMeter).toFixed(2)),
          description: detail.description || "",
        };
      }

      await axios.patch(`${BASE_URL}/units/bills/${data.id}/`, {
        unit_details_list: dataToSend,
      });


      toast.success("جزئیات بل با موفقیت بروزرسانی شد.");
      setIsUnitBillModalOpen(false);
    } catch (err) {
      console.error(
        "Error updating unit bill details:",
        err.response?.data || err.message
      );
      const errorMsg = err.response?.data
        ? JSON.stringify(err.response.data)
        : "خطا در بروزرسانی جزئیات بل.";
      toast.error(`بروزرسانی ناموفق: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const overallTotals = useMemo(() => {
    let currentTotalCharge = 0;
    let currentTotalPaid = 0;

    Object.values(unitDetails).forEach((detail) => {
      const unitTotal =
        safeParseFloat(detail.services) +
        safeParseFloat(detail.total_water_price) +
        safeParseFloat(detail.total_electricity);
      currentTotalCharge += unitTotal;
      currentTotalPaid += safeParseFloat(detail.taken);
    });
    const currentTotalRemainder = currentTotalCharge - currentTotalPaid;

    return {
      totalCharge: formatDisplay(currentTotalCharge),
      totalPaid: formatDisplay(currentTotalPaid),
      totalRemainder: formatDisplay(currentTotalRemainder),
    };
  }, [unitDetails]);

  const handleUnitPrintClick = (unitId, detail) => {
    const localService = safeParseFloat(detail.services);
    const localWaterPrice = safeParseFloat(detail.total_water_price);
    const localElecPrice = safeParseFloat(detail.total_electricity);
    const localTaken = safeParseFloat(detail.taken);
    const localTotals = localService + localWaterPrice + localElecPrice;
    const localRemainder = localTotals - localTaken;
/// new
    const printData = {
      name: detail.customer_name || "نامشخص",
      father_name: detail.customer_father_name || "نامشخص",
      shop: detail.unit_number || "نامشخص",
      taken: localTaken,
      remainder: localRemainder,
      billNumber: `UNIT-${data.year}-${data.month}-${unitId}`,
      billYear: data.year,
      billMonth: hijriMonths[data.month - 1],
      service_charge: localService,
      water_price: localWaterPrice,
      electricity_price: localElecPrice,
      previous_waterMeter: safeParseFloat(detail.previous_waterMeter),
      current_waterMeter: safeParseFloat(detail.current_waterMeter),
      previous_electricityMeter: safeParseFloat(
        detail.previous_electricityMeter
      ),
      current_electricityMeter: safeParseFloat(detail.current_electricityMeter),
    };
    setSelectedUnitForPrint(printData);
    setIsPrintModalOpen(true);
  };
  const handleClosePrintModal = () => {
    setIsPrintModalOpen(false);
    setSelectedUnitForPrint(null);
  };
  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
        <div className="relative bg-white p-5 md:p-6 rounded-lg shadow-xl w-full max-w-8xl max-h-[95vh] flex flex-col">
          <div className="flex justify-between items-center mb-4 pb-3 border-b">
            <h1 className="text-lg md:text-xl font-bold text-gray-800">
              جزئیات بل واحدها -{" "}
              {data.month ? hijriMonths[data.month - 1] : "?"} {data.year} (قابل
              ویرایش)
            </h1>

            <button
              onClick={() => setIsUnitBillModalOpen(false)}
              className="text-gray-500 hover:text-red-600 transition-colors text-2xl"
              disabled={isLoading}
              aria-label="بستن"
            >
              ×
            </button>
          </div>

          <div className="mb-4 border border-gray-200 bg-gray-50 p-3 rounded-md shadow-sm grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs md:text-sm">
            <p>
              <strong className="ml-1">سال:</strong> {data.year}
            </p>
            <p>
              <strong className="ml-1">ماه:</strong>{" "}
              {data.month ? hijriMonths[data.month - 1] : "?"}
            </p>
            <p className="font-semibold">
              <strong className="ml-1">مجموع کل شارژ:</strong>{" "}
              {overallTotals.totalCharge}
            </p>

            <p>
              <strong className="ml-1">مجموع کل پرداختی:</strong>{" "}
              {overallTotals.totalPaid}
            </p>

            <p className="font-semibold">
              <strong className="ml-1">مجموع کل باقی:</strong>{" "}
              {overallTotals.totalRemainder}
            </p>
          </div>

          <div className="flex-grow overflow-auto border border-gray-300 rounded-md">
            <table className="w-full min-w-[1350px] text-xs md:text-sm border-collapse">
              {" "}
              <thead className="sticky top-0 bg-primary text-white z-10">
                <tr className="text-center">
                  <th className="border border-gray-300 p-2">نمبر واحد</th>
                  <th className="border border-gray-300 p-2">نام ساکن</th>
                  <th className="border border-gray-300 p-2">خدمات</th>
                  <th className="border border-gray-300 p-2">کنتور آب قبلی</th>
                  <th className="border border-gray-300 p-2">کنتور آب فعلی</th>
                  <th className="border border-gray-300 p-2">قیمت آب</th>
                  <th className="border border-gray-300 p-2">کنتور برق قبلی</th>
                  <th className="border border-gray-300 p-2">کنتور برق فعلی</th>
                  <th className="border border-gray-300 p-2">قیمت برق</th>
                  <th className="border border-gray-300 p-2 font-semibold">
                    مجموعی
                  </th>
                  <th className="border border-gray-300 p-2 text-green-300">
                    گرفته شده
                  </th>
                  <th className="border border-gray-300 p-2 text-red-300">
                    باقیمانده
                  </th>
                  <th className="border border-gray-300 p-2">توضیحات</th>
                  <th className="border border-gray-300 p-2 print:hidden">
                    چاپ
                  </th>{" "}
                </tr>
              </thead>
              <tbody className="bg-white">
                {Object.entries(unitDetails).length > 0 ? (
                  Object.entries(unitDetails).map(([unitId, detail]) => {
                    const localService = safeParseFloat(detail.services);
                    const localWaterPrice = safeParseFloat(
                      detail.total_water_price
                    );
                    const localElecPrice = safeParseFloat(
                      detail.total_electricity
                    );
                    const localTaken = safeParseFloat(detail.taken);
                    const localTotals =
                      localService + localWaterPrice + localElecPrice;
                    const localRemainder = localTotals - localTaken;

                    return (
                      <tr
                        key={unitId}
                        className="border-b border-gray-200 text-center hover:bg-gray-50"
                      >
                        <td className="border border-gray-300 p-1.5 font-medium text-gray-800">
                          {detail.unit_number || "-"}
                        </td>
                        <td className="border border-gray-300 p-1.5 text-gray-700">
                          {detail.customer_name || "-"}
                        </td>

                        <td className="border border-gray-300 p-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-full p-1 border border-gray-300 rounded text-center text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            value={detail.services ?? ""}
                            onChange={(e) =>
                              handleInputChange(
                                unitId,
                                e.target.value,
                                "services"
                              )
                            }
                            disabled={isLoading}
                          />
                        </td>

                        <td className="border border-gray-300 p-1.5 text-gray-600">
                          {formatDisplay(
                            safeParseFloat(detail.previous_waterMeter)
                          )}
                        </td>
                        <td className="border border-gray-300 p-1">
                          <input
                            type="number"
                            step="0.01"
                            min={safeParseFloat(detail.previous_waterMeter)}
                            className="w-full p-1 border border-gray-300 rounded text-center text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            value={detail.current_waterMeter ?? ""}
                            onChange={(e) =>
                              handleInputChange(
                                unitId,
                                e.target.value,
                                "current_waterMeter"
                              )
                            }
                            disabled={isLoading}
                          />
                        </td>
                        <td className="border border-gray-300 p-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-full p-1 border border-blue-400 rounded text-center text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            value={detail.total_water_price ?? ""}
                            onChange={(e) =>
                              handleInputChange(
                                unitId,
                                e.target.value,
                                "total_water_price"
                              )
                            }
                            disabled={isLoading}
                          />
                        </td>

                        <td className="border border-gray-300 p-1.5 text-gray-600">
                          {formatDisplay(
                            safeParseFloat(detail.previous_electricityMeter)
                          )}
                        </td>
                        <td className="border border-gray-300 p-1">
                          <input
                            type="number"
                            step="0.01"
                            min={safeParseFloat(
                              detail.previous_electricityMeter
                            )}
                            className="w-full p-1 border border-gray-300 rounded text-center text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            value={detail.current_electricityMeter ?? ""}
                            onChange={(e) =>
                              handleInputChange(
                                unitId,
                                e.target.value,
                                "current_electricityMeter"
                              )
                            }
                            disabled={isLoading}
                          />
                        </td>
                        <td className="border border-gray-300 p-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-full p-1 border border-purple-400 rounded text-center text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                            value={detail.total_electricity ?? ""}
                            onChange={(e) =>
                              handleInputChange(
                                unitId,
                                e.target.value,
                                "total_electricity"
                              )
                            }
                            disabled={isLoading}
                          />
                        </td>

                        <td className="border border-gray-300 p-1.5 font-semibold text-gray-800 bg-gray-50">
                          {formatDisplay(localTotals)}
                        </td>

                        <td className="border border-gray-300 p-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max={localTotals > 0 ? localTotals : undefined}
                            className="w-full p-1 border border-green-400 rounded text-center text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                            value={detail.taken ?? ""}
                            onChange={(e) =>
                              handleInputChange(unitId, e.target.value, "taken")
                            }
                            disabled={isLoading}
                          />
                        </td>

                        <td className="border border-gray-300 p-1.5 font-medium text-red-700 bg-gray-50">
                          {formatDisplay(localRemainder)}
                        </td>

                        <td className="border border-gray-300 p-1">
                          <input
                            type="text"
                            className="w-full p-1 border border-gray-300 rounded text-center text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            value={detail.description || ""}
                            onChange={(e) =>
                              handleInputChange(
                                unitId,
                                e.target.value,
                                "description"
                              )
                            }
                            placeholder="نوت..."
                            disabled={isLoading}
                          />
                        </td>

                        <td className="border border-gray-300 p-1 print:hidden">
                          <button
                            onClick={() => handleUnitPrintClick(unitId, detail)}
                            className="p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                            title="چاپ رسید برای این واحد"
                            disabled={isLoading}
                          >
                            <Printer size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="14"
                      className="text-center p-4 text-gray-500 italic"
                    >
                      هیچ واحدی در این دوره بل برای نمایش وجود ندارد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t flex justify-center items-center gap-4">
            <button
              className={`${role == 3 ? "hidden" : ""
                } bg-green-600 text-white py-2 px-6 rounded-md cursor-pointer hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]`}
              onClick={handleUpdate}
              disabled={isLoading || Object.keys(unitDetails).length === 0}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {" "}
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>{" "}
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>{" "}
                </svg>
              ) : (
                "ثبت تغییرات"
              )}
            </button>
            <button
              className="bg-red-600 text-white hover:bg-red-700 cursor-pointer py-2 px-5 rounded-md transition-colors disabled:opacity-50"
              onClick={() => setIsUnitBillModalOpen(false)}
              disabled={isLoading}
            >
              بستن
            </button>
          </div>
        </div>{" "}
      </div>{" "}
      {isPrintModalOpen && (
        <PrintBillModal
          isOpen={isPrintModalOpen}
          onClose={handleClosePrintModal}
          customerData={selectedUnitForPrint}
          type="unit"
        />
      )}
    </>
  );
};

export default UnitBillDetails;
/// new chags 
