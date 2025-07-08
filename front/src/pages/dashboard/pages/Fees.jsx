import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ImageModal from "../../../features/authentication/hooks/ImageModal";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const Fees = () => {
  const [fees, setFees] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // For modal
  const [formData, setFormData] = useState({
    athlete: "",
    fee: "",
    taken: "",
    remainder: "",
    starting_date: "",
  });
  const [editId, setEditId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchFees();
    fetchAthletes();
  }, []);

  const fetchFees = async () => {
    const res = await axios.get(`${BASE_URL}/core/fees/`);
    setFees(res.data);
  };

  const fetchAthletes = async () => {
    const res = await axios.get(`${BASE_URL}/core/athletes/`);
    setAthletes(res.data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAthleteSelect = (athleteId) => {
    setFormData({ ...formData, athlete: athleteId });
    setDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const remainder =
        parseFloat(formData.fee || 0) - parseFloat(formData.taken || 0);
      const payload = {
        ...formData,
        fee: parseFloat(formData.fee),
        taken: parseFloat(formData.taken),
        remainder: remainder,
      };

      if (editId) {
        await axios.put(`${BASE_URL}/core/fees/${editId}/`, payload);
      } else {
        await axios.post(`${BASE_URL}/core/fees/`, payload);
      }
      setFormData({
        athlete: "",
        fee: "",
        taken: "",
        remainder: "",
        starting_date: "",
      });
      setEditId(null);
      fetchFees();
    } catch (error) {
      console.error("Error saving fee:", error);
    }
  };

  const handleEdit = (fee) => {
    setEditId(fee.id);
    setFormData({
      athlete: fee.athlete,
      fee: fee.fee,
      taken: fee.taken,
      remainder: fee.remainder,
      starting_date: fee.starting_date,
    });
  };

  const handleDelete = async (id) => {
    if (confirm("آیا مطمئن هستید که می‌خواهید حذف کنید؟")) {
      await axios.delete(`${BASE_URL}/core/fees/${id}/`);
      fetchFees();
    }
  };

  const selectedAthlete = athletes.find((a) => a.id === formData.athlete);

  return (
    <div
      className="max-w-4xl mx-auto mt-8 p-4 bg-white rounded-xl shadow-lg"
      dir="rtl"
    >
      <h2 className="text-xl font-bold mb-4 text-gray-800 border-b border-gray-300 pb-2 text-center">
        مدیریت فیس‌ها
      </h2>
      {/* Form */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-6 w-full max-w-sm mx-auto block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-300 shadow-md"
      >
        {showForm ? "بستن فرم فیس" : "ایجاد فیس جدید"}
      </button>
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div ref={dropdownRef} className="relative">
            <label className="block mb-1 text-sm font-medium">ورزشکار</label>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full border p-2 rounded-lg flex items-center justify-between"
            >
              {selectedAthlete ? (
                <>
                  <img
                    src={selectedAthlete.picture} // adjust if your field name differs
                    alt={selectedAthlete.name}
                    className="w-8 h-8 rounded-full ml-2 object-cover"
                  />
                  <span>
                    {selectedAthlete.name} {selectedAthlete.las_name}
                  </span>
                </>
              ) : (
                <span className="text-gray-400">یک ورزشکار را انتخاب کنید</span>
              )}{" "}
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {dropdownOpen && (
              <ul className="absolute z-10 w-full max-h-60 overflow-y-auto bg-white border rounded-md mt-1 shadow-lg">
                {athletes.map((a) => (
                  <li
                    key={a.id}
                    onClick={() => handleAthleteSelect(a.id)} // main li click
                    className="cursor-pointer flex items-center p-2 hover:bg-blue-100"
                  >
                    <img
                      onClick={(e) => {
                        e.stopPropagation(); // prevent li onClick when image is clicked
                        setSelectedImage(`${a.picture}`);
                      }}
                      src={a.picture}
                      alt={a.name}
                      className="w-8 h-8 rounded-full ml-2 object-cover"
                    />
                    <div>
                      {a.name} {a.last_name}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* The rest of the form fields stay unchanged */}

          <div>
            <label className="block mb-1 text-sm font-medium">مقدار فیس</label>
            <input
              name="fee"
              value={formData.fee}
              onChange={handleChange}
              type="number"
              step="0.01"
              required
              className="w-full border p-2 rounded-lg"
              placeholder="مثلاً ۵۰۰"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              مقدار گرفته‌شده
            </label>
            <input
              name="taken"
              value={formData.taken}
              onChange={handleChange}
              type="number"
              step="0.01"
              required
              className="w-full border p-2 rounded-lg"
              placeholder="مثلاً ۳۰۰"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">باقی‌مانده</label>
            <input
              name="remainder"
              value={formData.fee - formData.taken}
              type="number"
              step="0.01"
              readOnly
              className="w-full border p-2 rounded-lg bg-gray-100 cursor-not-allowed"
              placeholder={formData.fee - formData.taken}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">تاریخ شروع</label>
            <input
              type="date"
              name="starting_date"
              value={formData.starting_date}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
              required
            />
          </div>

          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            {editId ? "ویرایش فیس" : "ثبت فیس"}
          </button>
        </form>
      )}
      {/* Table stays unchanged */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border text-sm">
          <thead className="bg-gradient-to-r from-blue-100 to-blue-200">
            <tr>
              <th className="border p-2">تصویر ورزشکار</th>
              <th className="border p-2">نام ورزشکار</th>
              <th className="border p-2">مقدار فیس</th>
              <th className="border p-2">گرفته‌شده</th>
              <th className="border p-2">باقی‌مانده</th>
              <th className="border p-2">تاریخ شروع</th>
              <th className="border p-2">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(fees) && fees.length > 0 ? (
              fees.map((fee) => {
                const athlete = athletes.find((a) => a.id === fee.athlete);
                return (
                  <tr key={fee.id} className="text-center">
                    <td className="border p-2">
                      {athlete ? (
                        <img
                          src={
                            `${athlete.picture} ` ||
                            "https://via.placeholder.com/60"
                          }
                          alt={`${athlete.name} ${athlete.last_name}`}
                          className="h-10 w-10 rounded-full mx-auto object-cover"
                        />
                      ) : (
                        "نامشخص"
                      )}
                    </td>
                    <td className="border p-2">
                      {athlete
                        ? `${athlete.name} ${athlete.last_name}`
                        : "نامشخص"}
                    </td>
                    <td className="border p-2">{fee.fee}</td>
                    <td className="border p-2">{fee.taken}</td>
                    <td className="border p-2">{fee.remainder}</td>
                    <td className="border p-2">{fee.starting_date}</td>
                    <td className="border p-2 space-x-2">
                      <button
                        onClick={() => {
                          handleEdit(fee);
                          setShowForm(true); // Open form on edit
                        }}
                        className="text-blue-600 font-medium hover:underline"
                      >
                        ویرایش
                      </button>
                      <button
                        onClick={() => handleDelete(fee.id)}
                        className="text-red-600 font-medium hover:underline"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="p-4 text-gray-500 text-center">
                  هیچ فیس ثبت نشده است.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>{" "}
      {/* Image Modal */}
      <ImageModal
        imageSrc={selectedImage ? `${selectedImage}` : null}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
};

export default Fees;
