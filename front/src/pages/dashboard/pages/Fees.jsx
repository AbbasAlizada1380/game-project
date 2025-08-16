import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ImageModal from "../../../features/authentication/hooks/ImageModal";
import { motion, AnimatePresence } from "framer-motion";
import { FaRegEdit } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const Fees = () => {
  const [fees, setFees] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // For modal
  const [showFormModal, setShowFormModal] = useState(false); // modal state
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
    setShowFormModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm("آیا مطمئن هستید که می‌خواهید حذف کنید؟")) {
      await axios.delete(`${BASE_URL}/core/fees/${id}/`);
      fetchFees();
    }
  };

  const selectedAthlete = athletes.find((a) => a.id === formData.athlete);

  return (
    <div className="p-6">
      <div className="p-5 bg-white rounded-lg shadow-md">
        <h1 className="text-xl font-bold mb-4 text-gray-800 border-b border-gray-300 pb-2 text-center">
          مدیریت فیس‌ها
        </h1>

        <button
          onClick={() => {
            // resetForm();
            setShowFormModal(true);
          }}
          className="primary-btn"
        >
          {showForm ? "بستن فرم فیس" : "ایجاد فیس جدید"}
        </button>
      </div>
      {/* Form */}
      <AnimatePresence>
        {showFormModal && (
          <motion.div
            className="fixed inset-0 bg-black/65 flex items-center justify-center z-50"
            onClick={() => setShowFormModal(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-lg  max-w-xl w-full p-10 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowFormModal(false)}
                className="absolute top-1 right-3 text-red-500 cursor-pointer hover:text-gray-700 font-bold text-4xl"
              >
                ×
              </button>
              <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <div ref={dropdownRef} className="relative">
                  <label className="block mb-2 text-sm font-medium">
                    ورزشکار
                  </label>
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
                      <span className="text-gray-400">
                        یک ورزشکار را انتخاب کنید
                      </span>
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
                  <label className="block mb-2 text-sm font-medium">
                    مقدار فیس
                  </label>
                  <input
                    name="fee"
                    value={formData.fee}
                    onChange={handleChange}
                    type="number"
                    step="0.01"
                    required
                    className="input-filed"
                    placeholder="مثلاً ۵۰۰"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">
                    مقدار گرفته‌شده
                  </label>
                  <input
                    name="taken"
                    value={formData.taken}
                    onChange={handleChange}
                    type="number"
                    step="0.01"
                    required
                    className="input-filed"
                    placeholder="مثلاً ۳۰۰"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">
                    باقی‌مانده
                  </label>
                  <input
                    name="remainder"
                    value={formData.fee - formData.taken}
                    type="number"
                    step="0.01"
                    readOnly
                    className="input-filed"
                    placeholder={formData.fee - formData.taken}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">
                    تاریخ شروع
                  </label>
                  <input
                    type="date"
                    name="starting_date"
                    value={formData.starting_date}
                    onChange={handleChange}
                    className="input-filed"
                    required
                  />
                </div>

                <button className="primary-btn m3">
                  {editId ? "ویرایش فیس" : "ثبت فیس"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Table stays unchanged */}
      <div className="mt-8 overflow-x-auto rounded-lg p-5 bg-white">
        <table className="min-w-full ">
          <thead className="border-b border-gray-300">
            <tr className="hover:bg-opacity-90 transition duration-300 bg-stone-200">
              <th className="p-3 text-center font-semibold text-gray-700">
                تصویر ورزشکار
              </th>
              <th className="p-3 text-center font-semibold text-gray-700">
                نام ورزشکار
              </th>
              <th className="p-3 text-center font-semibold text-gray-700">
                مقدار فیس
              </th>
              <th className="p-3 text-center font-semibold text-gray-700">
                گرفته‌شده
              </th>
              <th className="p-3 text-center font-semibold text-gray-700">
                باقی‌مانده
              </th>
              <th className="p-3 text-center font-semibold text-gray-700">
                تاریخ شروع
              </th>
              <th className="p-3 text-center font-semibold text-gray-700">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(fees) && fees.length > 0 ? (
              fees.map((fee, index) => {
                const athlete = athletes.find((a) => a.id === fee.athlete);
                return (
                  <tr
                    key={fee.id}
                    className={`hover:bg-gray-50 transition-colors text-center cursor-pointer ${
                      index % 2 === 0 ? "bg-gray-100" : "bg-gray-50"
                    }`}
                  >
                    <td className=" p-2">
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
                    <td className=" p-2">
                      {athlete
                        ? `${athlete.name} ${athlete.last_name}`
                        : "نامشخص"}
                    </td>
                    <td className=" p-2">{fee.fee}</td>
                    <td className=" p-2">{fee.taken}</td>
                    <td className=" p-2">{fee.remainder}</td>
                    <td className=" p-2">{fee.starting_date}</td>

                    <td className="px-3 py-2 space-x-4">
                      <button
                        onClick={() => {
                          handleEdit(fee);
                          setShowForm(true); // Open form on edit
                        }}
                        className="text-green-600 hover:scale-105"
                      >
                        <FaRegEdit size={24} />
                      </button>
                      <button
                        onClick={() => handleDelete(fee.id)}
                        className="text-red-600 hover:scale-105"
                      >
                        <IoTrashSharp size={24} />
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
