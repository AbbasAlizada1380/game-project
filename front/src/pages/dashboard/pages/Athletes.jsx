import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import ImageModal from "../../../features/authentication/hooks/ImageModal";
const BASE_URL = import.meta.env.VITE_BASE_URL;
const Athletes = () => {
  const [athletes, setAthletes] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); // For modal
  const [showForm, setShowForm] = useState(false);
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
      await fetchAthletes();
      resetForm();
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
      nic: athlete.nic ? `${athlete.nic}` : null,
      picture: athlete.picture ? `${athlete.picture}` : null,
      document: athlete.document ? `${athlete.document}` : null,
    });
  };

  const handleDelete = async (id) => {
    await axios.delete(`${BASE_URL}/core/athletes/${id}/`);
    fetchAthletes();
  };
  const fileInputRefs = {
    nic: useRef(null),
    picture: useRef(null),
    document: useRef(null),
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

    setPreviews({
      nic: null,
      picture: null,
      document: null,
    });

    // Clear each file input using refs
    Object.values(fileInputRefs).forEach((ref) => {
      if (ref.current) {
        ref.current.value = "";
      }
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
      <h1 className="text-xl font-bold mb-4 text-gray-800 border-b border-gray-300 pb-2 text-center">
        مدیریت ورزشکاران
      </h1>

      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-6 w-full max-w-sm mx-auto block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-300 shadow-md"
      >
        {showForm ? "بستن فرم ورزشکار" : "افزودن ورزشکار جدید"}
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-10 space-y-6 bg-gray-50 p-8 rounded-2xl shadow-inner max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center">
            {editId ? "ویرایش ورزشکار" : "ایجاد ورزشکار"}
          </h2>

          {[
            { name: "name", label: "نام" },
            { name: "last_name", label: "نام خانوادگی" },
            { name: "father_name", label: "نام پدر" },
            { name: "current_location", label: "محل فعلی" },
            { name: "permanent_location", label: "محل اصلی" },
            { name: "date_of_birth", label: "تاریخ تولد", type: "date" },
          ].map(({ name, label, type = "text" }) => (
            <div key={name} className="relative">
              <label
                htmlFor={name}
                className="block text-md font-medium text-gray-700 mb-2"
              >
                {label}
              </label>
              <input
                id={name}
                name={name}
                type={type}
                value={formData[name]}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder={`لطفاً ${label.toLowerCase()} را وارد کنید`}
              />
            </div>
          ))}

          {[
            { name: "nic", label: "فایل تذکره/کارت هویت" },
            { name: "picture", label: "عکس" },
            { name: "document", label: "اسناد" },
          ].map(({ name, label }) => (
            <div key={name} className="relative">
              <label
                htmlFor={name}
                className="block text-md font-medium text-gray-700 mb-2"
              >
                {label}
              </label>
              <input
                ref={fileInputRefs[name]} // dynamic ref
                id={name}
                name={name}
                type="file"
                accept={name === "picture" ? "image/*" : undefined}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition cursor-pointer"
              />
              {previews[name] && (
                <div className="mt-3">
                  {name === "picture" || name === "nic" ? (
                    <img
                      src={previews[name]}
                      alt={label}
                      className="h-28 rounded-lg border shadow-sm object-contain"
                    />
                  ) : (
                    <a
                      href={previews[name]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm hover:text-blue-800 transition"
                    >
                      مشاهده فایل
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 shadow-md"
          >
            {editId ? "ویرایش ورزشکار" : "ایجاد ورزشکار"}
          </button>
        </form>
      )}

      <table className="min-w-full border border-gray-300 rounded-lg shadow-md text-sm bg-white">
        <thead className="bg-gradient-to-r from-blue-100 to-blue-200">
          <tr>
            <th className="p-3 border border-gray-300 text-center font-semibold text-gray-700">
              عکس
            </th>
            <th className="p-3 border border-gray-300 text-center font-semibold text-gray-700">
              نام
            </th>
            <th className="p-3 border border-gray-300 text-center font-semibold text-gray-700">
              نام خانوادگی
            </th>
            <th className="p-3 border border-gray-300 text-center font-semibold text-gray-700">
              عملیات
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(athletes) &&
            athletes.length > 0 &&
            athletes.map((athlete) => (
              <tr
                key={athlete.id}
                className="hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <td className="p-3 border border-gray-300 text-center">
                  <img
                    src={
                      athlete.picture
                        ? athlete.picture
                        : "https://via.placeholder.com/60?text=No+Image"
                    }
                    onClick={() => setSelectedImage(athlete.picture)}
                    alt={`${athlete.name} ${athlete.last_name}`}
                    className="h-14 w-14 object-cover rounded-full mx-auto border shadow-sm cursor-pointer"
                  />
                </td>

                <td className="p-3 border border-gray-300 text-center font-medium text-gray-800">
                  {athlete.name}
                </td>

                <td className="p-3 border border-gray-300 text-center font-medium text-gray-800">
                  {athlete.last_name}
                </td>

                <td className="p-3 border border-gray-300 text-center space-x-2">
                  <button
                    onClick={() => {
                      handleEdit(athlete);
                      setShowForm(true);
                    }}
                    className="bg-yellow-400 px-4 py-1 rounded-lg hover:bg-yellow-500 transition duration-200 shadow-sm"
                  >
                    ویرایش
                  </button>
                  <button
                    onClick={() => handleDelete(athlete.id)}
                    className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 transition duration-200 shadow-sm"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Image Modal */}
      <ImageModal
        imageSrc={selectedImage ? selectedImage : null}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
};

export default Athletes;
