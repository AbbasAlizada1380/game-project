// CustomerDetailsTable.js
import React, { useEffect, useState, useMemo } from "react"; // Added useMemo
import axios from "axios";
import { floors, months } from "./Hook/rentConstant"; // Ensure months is imported
import AddCustomers from "./Hook/AddCustomer"; // Assuming this is used
import PrintBillModal from "../pages/PrintBillModal"; // Adjust path if needed
import Swal from "sweetalert2";
import { Printer } from "lucide-react"; // Removed ArrowDownToLine if unused
import { useSelector } from "react-redux";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const CustomerDetailsTable = ({
  setIsDetailModalOpen,
  data, // This 'data' object contains year, time, floor for the overall record
  type, // 'rent' or 'service'
  setIsDetailFormOpen, // Pass this if AddCustomers needs it
}) => {
  
  const role = useSelector((state) => state.user.currentUser.role[0]);
  const [customers, setCustomers] = useState(data.customers_list || {});
  const [shopkeepers, setShopKeepers] = useState([]);
  const [updatedData, setUpdatedData] = useState({});
  const [error, setError] = useState(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedCustomerForPrint, setSelectedCustomerForPrint] =
    useState(null);

  const apiUrl =
    type === "service"
      ? `${BASE_URL}/services/${data.id}/`
      : `${BASE_URL}/rent/${data.id}/`;

  // --- Your original handleInputChange ---
  const handleInputChange = (customerId, field, value) => {
    const parsedValue = parseFloat(value) || 0;
    setCustomers((prev) => {
      const currentCustomer = prev[customerId] || {};
      const updatedCustomer = { ...currentCustomer, [field]: parsedValue };
      const total = parseFloat(
        type === "service" ? updatedCustomer.service : updatedCustomer.rant || 0
      );
      const taken = parseFloat(updatedCustomer.taken || 0);
      const remainder = total - taken;
      return {
        ...prev,
        [customerId]: {
          ...updatedCustomer,
          remainder: isNaN(remainder) ? 0 : remainder,
        },
      };
    });
    setUpdatedData((prev) => {
      const currentUpdate = prev[customerId] || {};
      const total = parseFloat(
        type === "service"
          ? field === "service"
            ? parsedValue
            : customers[customerId]?.service || 0
          : field === "rant"
          ? parsedValue
          : customers[customerId]?.rant || 0
      );
      const taken = parseFloat(
        field === "taken" ? parsedValue : customers[customerId]?.taken || 0
      );
      const calculatedRemainder = total - taken;
      return {
        ...prev,
        [customerId]: {
          ...currentUpdate,
          [field]: parsedValue,
          remainder: isNaN(calculatedRemainder) ? 0 : calculatedRemainder,
        },
      };
    });
  };

  // --- Your original handleSubmit ---
  const handleSubmit = async () => {
    const dataToSend = {};
    for (const [custId, custData] of Object.entries(updatedData)) {
      if (
        custData.hasOwnProperty("rant") ||
        custData.hasOwnProperty("service") ||
        custData.hasOwnProperty("taken")
      ) {
        const { remainder, ...rest } = custData;
        dataToSend[custId] = rest;
        if (!dataToSend[custId].hasOwnProperty("taken")) {
          dataToSend[custId].taken = customers[custId]?.taken || 0;
        }
        const totalField = type === "service" ? "service" : "rant";
        if (!dataToSend[custId].hasOwnProperty(totalField)) {
          dataToSend[custId][totalField] = customers[custId]?.[totalField] || 0;
        }
      }
    }
    if (Object.keys(dataToSend).length === 0) {
      alert("هیچ تغییری برای ثبت وجود ندارد.");
      return;
    }
    try {
      await axios.patch(apiUrl, {
        floor: data.floor,
        time: data.time,
        year: data.year,
        customers_list: dataToSend,
      });
      Swal.fire({
        icon: "success",
        title: "بروزرسانی شد",
        text: `جزئیات ${type === "service" ? "خدمات" : "کرایه"} بروز شد.`,
        confirmButtonText: "باشه",
      });
      setIsDetailModalOpen(false);
      if (setIsDetailFormOpen) setIsDetailFormOpen(false); // Close form if function provided
    } catch (error) {
      console.error("خطا در به‌روزرسانی اطلاعات:", error);
      let errorMsg = "به‌روزرسانی ناموفق بود.";
      if (error.response && error.response.data) {
        errorMsg += `\n ${JSON.stringify(error.response.data)}`;
      }
      Swal.fire({
        icon: "error",
        title: "خطا",
        text: errorMsg,
        confirmButtonText: "باشه",
      });
    }
  };

  // --- Your original fetchCustomers ---
  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/customers/`);
      // Assuming the API returns an array of customers with id, name, father_name etc.
      setShopKeepers(response.data);
      setError(null);
    } catch (err) {
      setError("خطا در دریافت اطلاعات مشتریان");
      console.error("Error fetching customers:", err);
    }
  };

  // --- Your original useEffect ---
  useEffect(() => {
    fetchCustomers();
    setUpdatedData(data.customers_list || {});
  }, [data.customers_list]); // Re-run if the initial customer list changes

  // --- MODIFIED Handlers for Print Modal ---
  const handlePrintClick = (customerId, customerRowData) => {
    // Find the full shopkeeper details using the customerId
    const shopkeeper = shopkeepers.find((shpkpr) => shpkpr.id == customerId); // Use == for type flexibility if needed, === is stricter
    if (!shopkeeper) {
      console.warn("Shopkeeper data not found for ID:", customerId);
      alert("اطلاعات کامل مشتری برای چاپ یافت نشد.");
      return;
    }

    // Calculate row-specific amounts for the receipt
    const rowTotalAmount = parseFloat(
      type === "service" ? customerRowData.service : customerRowData.rant || 0
    );
    const rowTakenAmount = parseFloat(customerRowData.taken || 0);
    const rowRemainderAmount =
      !isNaN(rowTotalAmount) && !isNaN(rowTakenAmount)
        ? rowTotalAmount - rowTakenAmount
        : customerRowData.remainder ?? 0;

    // Prepare data for PrintBillModal, ensuring all necessary fields are included
    const printData = {
      // --- Standard Fields ---
      name: shopkeeper.name || "نامشخص",
      // Pass the father's name using the key the modal expects
      customer_father_name: shopkeeper.father_name || null, // Or however father_name is stored in shopkeeper
      shop: customerRowData.shop
        ? customerRowData.shop.replace(/[\[\]']/g, "")
        : "نامشخص", // Cleaned shop number
      taken: rowTakenAmount,
      remainder: rowRemainderAmount,
      billNumber: `${type.toUpperCase()}-${data.year}-${
        data.time
      }-${customerId}`, // Example bill number

      // --- ADDED Year and Month ---
      billYear: data.year, // Get year from the main data prop
      billMonth:
        months.find((month) => month.value == data.time)?.label || data.time, // Get month label

      // --- Optional fields (can be useful for the modal) ---
      floor: data.floor, // Floor might be relevant context
      totalAmount_RentService: rowTotalAmount, // Pass the specific total for this row
    };

    // --- Debugging ---
    // console.log(`--- Preparing ${type} Bill Print Data ---`);
    // console.log(JSON.stringify(printData, null, 2));
    // --- End Debugging ---

    setSelectedCustomerForPrint(printData);
    setIsPrintModalOpen(true);
  };

  const handleClosePrintModal = () => {
    setIsPrintModalOpen(false);
    setSelectedCustomerForPrint(null);
  };
  // --- End Handlers for Print Modal ---

  // Calculate totals for the summary display at the top of the table
  const localTotals = useMemo(() => {
    // Use useMemo hook
    let total_rent_service = 0;
    let total_taken = 0;
    Object.values(customers).forEach((cust) => {
      const amount = parseFloat(
        type === "service" ? cust.service : cust.rant || 0
      );
      const taken = parseFloat(cust.taken || 0);
      if (!isNaN(amount)) total_rent_service += amount;
      if (!isNaN(taken)) total_taken += taken;
    });
    const total_remainder = total_rent_service - total_taken;
    return {
      total: total_rent_service,
      total_taken: total_taken,
      total_remainder: total_remainder,
    };
  }, [customers, type]); // Dependencies for useMemo

  return (
    <div key={data.id}>
      {" "}
      {/* Key forces re-render on data change */}
      <div className="container mx-auto p-6 text-right">
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Summary Display */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <p>
            <strong>منزل:</strong>{" "}
            {floors.find((floor) => floor.value == data.floor)?.label ||
              data.floor}
          </p>
          <p>
            <strong>سال:</strong> {data.year}
          </p>
          <p>
            <strong>ماه:</strong>{" "}
            {months.find((month) => month.value == data.time)?.label ||
              data.time}
          </p>
          <p>
            <strong>مجموع ({type === "service" ? "خدمات" : "کرایه"}):</strong>{" "}
            {localTotals.total?.toLocaleString()}
          </p>
          <p>
            <strong>مجموع گرفته‌شده:</strong>{" "}
            {localTotals.total_taken?.toLocaleString()}
          </p>
          <p>
            <strong>مجموع باقیمانده:</strong>{" "}
            {localTotals.total_remainder?.toLocaleString()}
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full mt-4 border-collapse border border-gray-300">
            {/* Table Head */}
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">مشتری</th>
                <th className="border p-2">شماره دوکان</th>
                <th className="border p-2">
                  مجموع ({type === "service" ? "خدمات" : "کرایه"})
                </th>
                <th className="border p-2">دریافتی</th>
                <th className="border p-2">باقیمانده</th>
                <th className="border p-2 print:hidden">چاپ رسید</th>
              </tr>
            </thead>
            {/* Table Body */}
            <tbody>
              {Object.entries(customers).length > 0 ? (
                Object.entries(customers).map(([id, customer]) => {
                  // Calculate display remainder for the row
                  const displayTotal = parseFloat(
                    type === "service" ? customer.service : customer.rant || 0
                  );
                  const displayTaken = parseFloat(customer.taken || 0);
                  const displayRemainder =
                    !isNaN(displayTotal) && !isNaN(displayTaken)
                      ? (displayTotal - displayTaken).toLocaleString()
                      : (customer.remainder ?? 0).toLocaleString();

                  return (
                    <tr
                      key={id}
                      className="border hover:bg-gray-50 text-center"
                    >
                      {/* Customer Name */}
                      <td className="border p-2">
                        {" "}
                        {shopkeepers.find((shpkpr) => shpkpr.id == id)?.name ||
                          "..."}{" "}
                      </td>
                      {/* Shop Number */}
                      <td className="border p-2">
                        {" "}
                        {customer.shop
                          ? customer.shop.replace(/[\[\]']/g, "") || "نامشخص"
                          : "نامشخص"}{" "}
                      </td>
                      {/* Total Input */}
                      <td className="border p-2">
                        {" "}
                        <input
                          type="number"
                          value={
                            type === "service"
                              ? customer.service ?? ""
                              : customer.rant ?? ""
                          }
                          onChange={(e) =>
                            handleInputChange(
                              id,
                              type === "service" ? "service" : "rant",
                              e.target.value
                            )
                          }
                          className="w-full p-1 border rounded text-right"
                          min="0"
                        />{" "}
                      </td>
                      {/* Taken Input */}
                      <td className="border p-2">
                        {" "}
                        <input
                          type="number"
                          value={customer.taken ?? ""}
                          onChange={(e) =>
                            handleInputChange(id, "taken", e.target.value)
                          }
                          className="w-full p-1 border rounded text-right"
                          min="0"
                        />{" "}
                      </td>
                      {/* Display Remainder */}
                      <td className="border p-2"> {displayRemainder} </td>
                      {/* Print Button */}
                      <td className="border p-2 print:hidden">
                        <button
                          onClick={() => handlePrintClick(id, customer)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="چاپ رسید برای این مشتری"
                        >
                          {" "}
                          <Printer size={20} />{" "}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                // Row shown if no customers exist for this record
                <tr>
                  <td colSpan="6" className="text-center p-4 text-gray-500">
                    هیچ مشتری در این لیست وجود ندارد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6">
          {/* Use flex for better layout */}
          <button
            onClick={handleSubmit}
            className={`${
              role == 3 ? "hidden" : ""
            } px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-200`}
            disabled={Object.keys(updatedData).length === 0}
          >
            ثبت تغییرات
          </button>
          {/* AddCustomers Component */}
          <span className={`${role == 3 ? "hidden" : ""
            }`}>
            <AddCustomers
              type={type}
              data={data}
              setIsDetailModalOpen={setIsDetailModalOpen}
              setIsDetailFormOpen={setIsDetailFormOpen} // Pass if needed by AddCustomers
            />
          </span>
        </div>
      </div>
      {/* Render the Print Modal */}
      <PrintBillModal
        isOpen={isPrintModalOpen}
        onClose={handleClosePrintModal}
        customerData={selectedCustomerForPrint} // Pass the prepared data
        type={type} // Pass 'rent' or 'service'
      />
    </div>
  );
};

export default CustomerDetailsTable;
