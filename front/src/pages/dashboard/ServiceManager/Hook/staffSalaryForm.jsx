import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const StaffSalaryForm = ({ id, month, year }) => {
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
      .get(`${BASE_URL}/staff/staff`)
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

    const formData = {
      id,
      month,
      year,
      total: parseFloat(salary),
      customers_list: {
        [selectedStaffId]: {
          salary: parseFloat(salary),
          taken: parseFloat(taken),
          remainder,
        },
      },
    };

    setIsLoading(true);
    setMessage("");
    try {
      await axios.patch(`${BASE_URL}/staff/salaries/${id}/`, formData);
      setMessage("معلومات موفقانه ثبت شد");
      // Optionally clear fields
      setSelectedStaffId("");
      setSalary("");
      setTaken("");
    } catch (err) {
      console.error("Patch error:", err);
      setMessage("خطا در ثبت اطلاعات");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <button
        onClick={() => setShowForm((prev) => !prev)}
        className="w-full mb-4 bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        {showForm ? "بستن فورم" : "نمایش فورم معاش"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 rounded-xl shadow">
          <h2 className="text-lg font-bold text-white mb-4">ثبت معاش کارمند</h2>

          {/* Staff Selector */}
          <div className="relative mb-6">
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full peer p-3 pt-5 text-sm border rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" disabled hidden></option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name}
                </option>
              ))}
            </select>
            <label className="absolute right-3 top-1 text-gray-500 text-xs peer-focus:text-blue-600">
              کارمند
            </label>
          </div>

          {/* Salary Input */}
          <div className="relative mb-6">
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="w-full peer p-3 pt-5 text-sm border rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <label className="absolute right-3 top-1 text-gray-500 text-xs peer-focus:text-blue-600">
              معاش
            </label>
          </div>

          {/* Taken Input */}
          <div className="relative mb-6">
            <input
              type="number"
              value={taken}
              onChange={(e) => setTaken(e.target.value)}
              className="w-full peer p-3 pt-5 text-sm border rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <label className="absolute right-3 top-1 text-gray-500 text-xs peer-focus:text-blue-600">
              گرفته شده
            </label>
          </div>

          {/* Remainder Input */}
          <div className="relative mb-6">
            <input
              type="number"
              value={remainder}
              disabled
              className="w-full peer p-3 pt-5 text-sm border rounded bg-gray-100 focus:outline-none"
            />
            <label className="absolute right-3 top-1 text-gray-500 text-xs">
              باقی مانده
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {isLoading ? "در حال ارسال..." : "ارسال"}
          </button>

          {message && (
            <p className="mt-4 text-center text-red-500">{message}</p>
          )}
        </form>
      )}
    </div>
  );
};

export default StaffSalaryForm;
