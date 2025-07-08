import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const AddCustomer = ({
  type,
  data,
  setIsDetailModalOpen,
  setIsDetailFormOpen,
}) => {
  const { total, id: Id, time, year, floor, customers_list } = data;
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [salary, setSalary] = useState("");
  const [taken, setTaken] = useState("");
  const [remainder, setRemainder] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false); // toggle state

  // Fetch staff list
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/customers`)
      .then((res) => {
        setStaffList(res.data);
      })
      .catch((err) => console.error("Error fetching staff:", err));
  }, []);

  // Calculate remainder
  useEffect(() => {
    const sal = parseFloat(salary) || 0;
    const tak = parseFloat(taken) || 0;
    setRemainder(sal - tak);
  }, [salary, taken]);

  // Submit data
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaffId) return setMessage("لطفا کارمند را انتخاب کنید");

    // Prepare the updated customers_list
    const updatedCustomersList = { ...customers_list };

    updatedCustomersList[selectedStaffId] = {
      service: parseFloat(salary) || 0,
      rant: parseFloat(salary) || 0,
      taken: parseFloat(taken) || 0,
      remainder,
    };

    // Recalculate total_taken and total_remainder
    const totalTaken = Object.values(updatedCustomersList).reduce(
      (sum, customer) => sum + (customer.taken || 0),
      0
    );
    const totalRemainder = Object.values(updatedCustomersList).reduce(
      (sum, customer) => sum + (customer.remainder || 0),
      0
    );

    // Prepare the formData object
    // Recalculate total with the correct addition
    const formData = {
      total: parseFloat(total) + parseFloat(salary), // Correct addition of total and salary
      // total_taken: parseFloat(totalTaken)+parseFloat(taken),/
      customers_list: updatedCustomersList,
      time,
      year,
      floor,
    };

    // Set the correct API URL based on the type
    let apiUrl;
    if (type === "service") {
      apiUrl = `${BASE_URL}/services/${Id}/`; // Endpoint for services
    } else if (type === "rent") {
      apiUrl = `${BASE_URL}/rent/${Id}/`; // Endpoint for rent
    } else {
      return setMessage("نوع درخواست نامعتبر است");
    }

    setIsLoading(true);
    setMessage("");

    try {
      // Send the request to the corresponding API endpoint
      await axios.patch(apiUrl, formData);
      setMessage("معلومات موفقانه ثبت شد");

      // Optionally clear fields
      setSelectedStaffId("");
      setSalary("");
      setTaken("");
      setShowForm(!showForm);
      setIsDetailModalOpen(false);
      setIsDetailFormOpen(false);
    } catch (err) {
      console.error("Patch error:", err);
      setMessage("خطا در ثبت اطلاعات");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="">
      <div className="flex justify-center items-center ">
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className=" mb-4 bg-green-600 px-5 cursor-pointer text-white py-2 rounded hover:bg-green-700"
        >
          {showForm ? "بستن فورم" : "نمایش فورم معاش"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="px-4">
          <h2 className="text-lg font-bold text-white mb-4">ثبت معاش کارمند</h2>

          <div className="grid grid-cols-2 gap-4 ">
            {/* Staff Selector */}
            <div className="relative mb-6">
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full peer p-2  text-sm border rounded bg-white focus:outline-none "
                required
              >
                <option value="" disabled hidden></option>
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name}
                  </option>
                ))}
              </select>
              <label className="absolute right-3 top-3 text-gray-500 text-xs peer-focus:text-blue-600">
                دوکاندار
              </label>
            </div>

            {/* Salary Input */}
            <div className="relative mb-6">
              <input
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full peer p-2 text-sm border rounded bg-white focus:outline-none "
                required
              />
              <label className="absolute right-3 top-3 text-gray-500 text-xs ">
                مجموع {type === "service" ? "خدمات" : "کرایه"}
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 ">
            {/* Taken Input */}
            <div className="relative mb-6">
              <input
                type="number"
                value={taken}
                onChange={(e) => setTaken(e.target.value)}
                placeholder="گرفته شده"
                className="w-full peer p-2 text-sm border rounded bg-white focus:outline-none "
                required
              />
            </div>

            {/* Remainder Input */}
            <div className="relative mb-6">
              <input
                type="number"
                value={remainder}
                placeholder="باقی مانده"
                disabled
                className="w-full peer p-2 text-sm border rounded bg-gray-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-center items-center ">
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="px-10 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              {isLoading ? "در حال ارسال..." : "ارسال"}
            </button>
          </div>

          {message && (
            <p className="mt-4 text-center text-red-500">{message}</p>
          )}
        </form>
      )}
    </div>
  );
};

export default AddCustomer;
