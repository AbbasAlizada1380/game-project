import React, { useEffect, useState, useMemo } from "react"; 
import axios from "axios";
import { shamsiMonths } from "../../../../utils/dateConvert"; 
import StaffSalaryForm from "./staffSalaryForm";
import PrintBillModal from "../../../../pages/dashboard/pages/PrintBillModal"; 
import Swal from "sweetalert2";
import { Printer } from "lucide-react";
import { useSelector } from "react-redux";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const SalaryDetails = ({ data, setIsSalaryModalOpen }) => {
  
  const role = useSelector((state) => state.user.currentUser.role[0]);
  const [staffList, setStaffList] = useState([]);
  const [salariesData, setSalariesData] = useState(data.customers_list || {}); 


  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedStaffForPrint, setSelectedStaffForPrint] = useState(null);

  const fetchStaff = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/staff/staff/`);
      setStaffList(response.data);
    } catch (err) {
      console.error("Error fetching staff:", err);
    }
  };

  useEffect(() => {
    fetchStaff();
    setSalariesData(data.customers_list || {});
  }, [data.customers_list]); // Dependency added

  const handleInputChange = (id, value, field) => {
    setSalariesData((prev) => {
      const updatedStaffSalary = {
        ...(prev[id] || {}), // Ensure previous fields are kept if not editing salary/taken
        [field]: parseFloat(value) || 0,
      };

      updatedStaffSalary.remainder =
        (updatedStaffSalary.salary || 0) - (updatedStaffSalary.taken || 0);

      return {
        ...prev,
        [id]: updatedStaffSalary,
      };
    });
  };

  const handleUpdate = async () => {
    let hasInvalidData = false;
    Object.values(salariesData).forEach((staffSal) => {
      if (
        isNaN(parseFloat(staffSal.salary)) ||
        isNaN(parseFloat(staffSal.taken))
      ) {
        hasInvalidData = true;
      }
      if ((staffSal.salary || 0) < (staffSal.taken || 0)) {
      }
    });

    if (hasInvalidData) {
      Swal.fire(
        "خطا",
        "لطفاً مقادیر معتبر برای معاش و پرداختی وارد کنید.",
        "error"
      );
      return;
    }

    try {
      await axios.patch(`${BASE_URL}/staff/salaries/${data.id}/`, {
        customers_list: salariesData,
      });
      Swal.fire({
        icon: "success",
        title: "بروزرسانی شد",
        text: "جزئیات معاشات با موفقیت بروز شد.",
        confirmButtonText: "باشه",
      });
      setIsSalaryModalOpen(false); // Close modal on successful update
    } catch (err) {
      console.error("Error updating salary:", err);
      let errorMsg = "به‌روزرسانی ناموفق بود.";
      if (err.response && err.response.data) {
        errorMsg += `\n ${JSON.stringify(err.response.data)}`;
      }
      Swal.fire({
        icon: "error",
        title: "خطا در بروزرسانی",
        text: errorMsg,
        confirmButtonText: "باشه",
      });
    }
  };

  const handlePrintClick = (staffId, staffSalaryRowData) => {
    const staffMember = staffList.find((s) => String(s.id) === String(staffId));
    if (!staffMember) {
      Swal.fire("خطا", "جزئیات کارمند برای چاپ یافت نشد.", "error");
      console.warn("Staff member data not found for ID:", staffId, staffList);
      return;
    }

    const salaryAmount = parseFloat(staffSalaryRowData.salary || 0);
    const takenAmount = parseFloat(staffSalaryRowData.taken || 0);
    const remainderAmount = salaryAmount - takenAmount;

    const printData = {
      name: staffMember.name || "نامشخص",
      customer_father_name: staffMember.father_name || null,
      staff_identifier:
        staffMember.employee_code || staffMember.tazkira_number || null, // Use a relevant identifier

      totalAmount_Salary: salaryAmount, // Specific field for salary total
      taken: takenAmount,
      remainder: remainderAmount,

      billYear: data.year,
      billMonth: shamsiMonths[data.month - 1] || data.month.toString(), // Get month label

      billNumber: `SALARY-${data.year}-${data.month}-${staffId}`, // Example bill number
      // 'shop' and 'floor' are generally not applicable to salary slips in this context
    };


    setSelectedStaffForPrint(printData);
    setIsPrintModalOpen(true);
  };

  const handleClosePrintModal = () => {
    setIsPrintModalOpen(false);
    setSelectedStaffForPrint(null);
  };

  const summaryTotals = useMemo(() => {
    let total_salary = 0;
    let total_paid = 0;
    Object.values(salariesData).forEach((sal) => {
      total_salary += parseFloat(sal.salary) || 0;
      total_paid += parseFloat(sal.taken) || 0;
    });
    return {
      total_salary,
      total_paid,
      total_remaining: total_salary - total_paid,
    };
  }, [salariesData]);

  return (
    <>
      <div className="fixed inset-0 bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-40">
        <div className="bg-white p-6 rounded-lg shadow-xl w-11/12 md:w-2/3 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h1 className="text-xl font-semibold text-gray-700">
              جزئیات پرداخت معاشات
            </h1>
            <button
              onClick={() => setIsSalaryModalOpen(false)}
              className="text-red-500 hover:text-red-700 text-2xl font-bold"
              aria-label="بستن"
            >
              ×
            </button>
          </div>

          <div key={data.id} className="mb-6">
            {" "}
            {/* Removed border/shadow from here */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4 p-3 bg-gray-50 rounded border border-gray-200">
              <p>
                <strong>سال:</strong> {data.year}
              </p>
              <p>
                <strong>ماه:</strong> {shamsiMonths[data.month - 1]}
              </p>
              <p>
                <strong>مجموع معاشات (این لیست):</strong>{" "}
                {summaryTotals.total_salary.toLocaleString()}
              </p>
              <p>
                <strong>مجموع پرداختی (این لیست):</strong>{" "}
                {summaryTotals.total_paid.toLocaleString()}
              </p>
              <p>
                <strong>مجموع باقیمانده (این لیست):</strong>{" "}
                {summaryTotals.total_remaining.toLocaleString()}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full mt-4 border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-primary text-white text-md font-semibold uppercase tracking-wider">
                    <th className="border p-2">کارمند</th>
                    <th className="border p-2">مجموع معاش</th>
                    <th className="border p-2">مقدار پرداختی</th>
                    <th className="border p-2">باقیمانده</th>
                    <th className="border p-2 print:hidden">چاپ</th>{" "}
                    {/* Added Print Header */}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(salariesData).map(([id, staffSalary]) => {
                    const staffDetail = staffList.find(
                      (s) => String(s.id) === String(id)
                    );
                    const remainder =
                      (parseFloat(staffSalary.salary) || 0) -
                      (parseFloat(staffSalary.taken) || 0);
                    return (
                      <tr
                        key={id}
                        className="border-b text-center hover:bg-gray-50"
                      >
                        <td className="p-2 border">
                          {staffDetail?.name || `کارمند (${id})`}
                        </td>
                        <td className="p-2 border">
                          <input
                            type="number"
                            className="w-full p-1 border rounded text-right"
                            value={staffSalary.salary ?? ""}
                            onChange={(e) =>
                              handleInputChange(id, e.target.value, "salary")
                            }
                            min="0"
                          />
                        </td>
                        <td className="p-2 border">
                          <input
                            type="number"
                            className="w-full p-1 border rounded text-right"
                            value={staffSalary.taken ?? ""}
                            onChange={(e) =>
                              handleInputChange(id, e.target.value, "taken")
                            }
                            min="0"
                          />
                        </td>
                        <td className="p-2 border">
                          {remainder.toLocaleString()}
                        </td>
                        <td className="p-2 border print:hidden">
                          {" "}
                          {/* Added Print Cell */}
                          <button
                            onClick={() => handlePrintClick(id, staffSalary)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="چاپ رسید معاش برای این کارمند"
                          >
                            <Printer size={20} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  <tr>
                    <td colSpan={5} className={`${role == 3 ? "hidden" : ""
                      } pt-2 p-0`}>
                      <StaffSalaryForm
                        salaryListId={data.id} // Pass salary list ID
                        month={data.month}
                        year={data.year}
                        onSalaryAdded={() => {
                         
                        }}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-end items-center gap-3">
              <button
                className={`${role == 3 ? "hidden" : ""
                  } px-6 py-2 bg-green-600 text-white rounded-md cursor-pointer hover:bg-green-700 transition-all disabled:opacity-50`}
                onClick={handleUpdate}
                disabled={Object.keys(salariesData).length === 0} // Basic check if there's anything to update
              >
                ثبت تغییرات
              </button>
              <button
                className="px-6 py-2 bg-red-500 text-white cursor-pointer rounded-md transition-all"
                onClick={() => setIsSalaryModalOpen(false)}
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      </div>

      <PrintBillModal
        isOpen={isPrintModalOpen}
        onClose={handleClosePrintModal}
        customerData={selectedStaffForPrint}
        type="salary"
      />
    </>
  );
};

export default SalaryDetails;
