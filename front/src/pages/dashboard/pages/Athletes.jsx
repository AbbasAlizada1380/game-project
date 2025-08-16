import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import ImageModal from "../../../features/authentication/hooks/ImageModal";
import { FaRegEdit } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import { IoEyeOutline } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const Athletes = () => {
  const [athletes, setAthletes] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false); // modal state
  const [formData, setFormData] = useState({
    name: "",
    last_name: "",
    father_name: "",
    current_location: "",
    permanent_location: "",
    date_of_birth: "",
    nic: null,
    picture: null,
    document: null,
  });
  const [previews, setPreviews] = useState({
    nic: null,
    picture: null,
    document: null,
  });
  const [editId, setEditId] = useState(null);

  const fileInputRefs = {
    nic: useRef(null),
    picture: useRef(null),
    document: useRef(null),
  };

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    const res = await axios.get(`${BASE_URL}/core/athletes/`);
    setAthletes(res.data);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      setFormData({ ...formData, [name]: files[0] });
      setPreviews({ ...previews, [name]: URL.createObjectURL(files[0]) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    try {
      if (editId) {
        await axios.put(`${BASE_URL}/core/athletes/${editId}/`, data);
        setEditId(null);
      } else {
        await axios.post(`${BASE_URL}/core/athletes/`, data);
      }
      fetchAthletes();
      resetForm();
      setShowFormModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (athlete) => {
    setEditId(athlete.id);
    setFormData({
      name: athlete.name,
      last_name: athlete.last_name,
      father_name: athlete.father_name,
      current_location: athlete.current_location,
      permanent_location: athlete.permanent_location,
      date_of_birth: athlete.date_of_birth,
      nic: null,
      picture: null,
      document: null,
    });

    setPreviews({
      nic: athlete.nic ? athlete.nic : null,
      picture: athlete.picture ? athlete.picture : null,
      document: athlete.document ? athlete.document : null,
    });
    setShowFormModal(true);
  };

  const handleDelete = async (id) => {
    await axios.delete(`${BASE_URL}/core/athletes/${id}/`);
    fetchAthletes();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      last_name: "",
      father_name: "",
      current_location: "",
      permanent_location: "",
      date_of_birth: "",
      nic: null,
      picture: null,
      document: null,
    });
    setPreviews({ nic: null, picture: null, document: null });

    Object.values(fileInputRefs).forEach((ref) => {
      if (ref.current) ref.current.value = "";
    });
  };

  return (
    <div className="p-6">
      <div className="p-5 bg-white rounded-lg shadow-md">
        <h1 className="text-xl font-bold mb-4 text-gray-800 border-b border-gray-300 pb-2 text-center">
          مدیریت ورزشکاران
        </h1>

        <button
          onClick={() => {
            resetForm();
            setShowFormModal(true);
          }}
          className="mb-6 w-full max-w-sm mx-auto block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold  cursor-pointer shadow-md hover:scale-103 transition-all duration-500"
        >
          افزودن عضو جدید
        </button>
      </div>

      {/* Athletes Table */}
      <div className="mt-8 overflow-x-auto rounded-lg p-5 bg-white">
        <table className="min-w-full bg-stone-200">
          <thead className="border-b border-gray-300">
            <tr className="hover:bg-opacity-90 transition duration-300">
              <th className="p-3 text-center font-semibold text-gray-700">
                عکس
              </th>
              <th className="p-3 text-center font-semibold text-gray-700">
                نام
              </th>
              <th className="p-3 text-center font-semibold text-gray-700">
                نام خانوادگی
              </th>
              <th className="p-3 text-center font-semibold text-gray-700">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-100">
            {athletes.map((athlete, index) => (
              <tr
                key={athlete.id}
                className={`hover:bg-gray-50 transition-colors text-center cursor-pointer ${
                  index % 2 === 0 ? "bg-gray-100" : "bg-gray-50"
                }`}
              >
                <td className="px-3 py-2 border-gray-300 text-center">
                  <img
                    src={
                      athlete.picture ||
                      "https://via.placeholder.com/60?text=No+Image"
                    }
                    onClick={() => setSelectedImage(athlete.picture)}
                    alt={`${athlete.name} ${athlete.last_name}`}
                    className="h-10 w-10 object-cover rounded-full mx-auto shadow-sm cursor-pointer"
                  />
                </td>
                <td className="px-3 py-2 border-gray-300 text-center font-medium text-gray-800">
                  {athlete.name}
                </td>
                <td className="px-3 py-2 border-gray-300 text-center font-medium text-gray-800">
                  {athlete.last_name}
                </td>
                <td className="px-3 py-2 space-x-4">
                  <button
                    onClick={() => handleEdit(athlete)}
                    className="text-green-600 hover:scale-105"
                  >
                    <FaRegEdit size={24} />
                  </button>
                  <button
                    onClick={() => handleDelete(athlete.id)}
                    className="text-red-600 hover:scale-105"
                  >
                    <IoTrashSharp size={24} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
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
              className="bg-white rounded-2xl shadow-lg max-w-4xl w-full p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowFormModal(false)}
                className="absolute top-3 right-3 text-red-500 cursor-pointer hover:text-gray-700 font-bold text-4xl"
              >
                ×
              </button>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3"
              >
                {/* Form Title spans both columns */}
                <h2 className="text-2xl font-semibold text-center col-span-2 ">
                  {editId ? "ویرایش عضو" : "ایجاد عضو جدید"}
                </h2>

                {/* Text Inputs */}
                {[
                  { name: "name", label: "نام" },
                  { name: "last_name", label: "نام خانوادگی" },
                  { name: "father_name", label: "نام پدر" },
                  { name: "current_location", label: "محل فعلی" },
                  { name: "permanent_location", label: "محل اصلی" },
                  { name: "date_of_birth", label: "تاریخ تولد", type: "date" },
                ].map(({ name, label, type = "text" }) => (
                  <div key={name} className="flex flex-col">
                    <label className="block text-md font-medium text-gray-700 mb-2">
                      {label}
                    </label>
                    <input
                      name={name}
                      type={type}
                      value={formData[name]}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black/50 transition"
                      placeholder={`لطفاً ${label.toLowerCase()} را وارد کنید`}
                    />
                  </div>
                ))}

                {/* File Inputs */}
                {[
                  { name: "nic", label: "فایل تذکره/کارت هویت" },
                  { name: "picture", label: "عکس" },
                  { name: "document", label: "اسناد" },
                ].map(({ name, label }) => (
                  <div key={name} className="flex flex-col relative">
                    <label className="block text-md font-medium text-gray-700 mb-2">
                      {label}
                    </label>

                    <div className="flex items-center gap-x-2">
                      <input
                        ref={fileInputRefs[name]}
                        name={name}
                        type={name === "date_of_birth" ? "date" : "file"}
                        accept={name === "picture" ? "image/*" : undefined}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-1.5 bg-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-500 file:to-purple-500 file:text-white hover:file:bg-blue-100 transition cursor-pointer"
                      />

                      {/* Preview for existing or newly selected files */}
                      {previews[name] && (
                        <div className="mt-2 flex items-center gap-2">
                          {name === "picture" || name === "nic" ? (
                            <a
                              href={previews[name]}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <img
                                src={previews[name]}
                                alt={label}
                                className="h-12 rounded-full w-12"
                              />
                            </a>
                          ) : (
                            <a
                              href={previews[name]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline text-sm hover:text-blue-800 transition"
                            >
                              <IoEyeOutline className="text-4xl" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Submit button spans both columns */}
                <button
                  type="submit"
                  className="col-span-2 w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 cursor-pointer shadow-md hover:scale-103 transition-all duration-500"
                >
                  {editId ? "ویرایش عضو" : " افزودن عضو جدید"}
                </button>
              </form>
              ;
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Modal */}
      <ImageModal
        imageSrc={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
};

export default Athletes;
