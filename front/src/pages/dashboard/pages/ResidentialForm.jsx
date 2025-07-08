import React, { useState } from "react";
import axios from "axios";

const ResidentialForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    services: "",
    unitCount: "",
    status: "",
    waterMeter: "",
    electricityMeter: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false); // Toggle state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        "http://your-base-url/residential",
        formData
      );
      setMessage("اطلاعات با موفقیت ارسال شد");
      setFormData({
        name: "",
        fatherName: "",
        services: "",
        unitCount: "",
        status: "",
        waterMeter: "",
        electricityMeter: "",
      });
    } catch (error) {
      setMessage("خطا در ارسال اطلاعات");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={() => setShowForm((prev) => !prev)}
        className="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
      >
        {showForm ? "بستن فرم" : "ثبت ملک جدید"}
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 max-w-xl mx-auto p-6 bg-white shadow rounded-lg space-y-4"
        >
          <h2 className="text-xl font-semibold text-center mb-4">
            ثبت ملک مسکونی
          </h2>

          {[
            { label: "نام", name: "name" },
            { label: "نام پدر", name: "fatherName" },
            { label: "خدمات", name: "services" },
            { label: "نمبر واحد", name: "uniteNumber" },
            { label: "وضعیت", name: "status" },
            { label: "شماره کنتور آب", name: "waterMeter" },
            { label: "شماره کنتور برق", name: "electricityMeter" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1">
                {field.label}
              </label>
              <input
                type={
                  [
                    "services",
                    "uniteNumber",
                    "waterMeter",
                    "electricityMeter",
                  ].includes(field.name)
                    ? "number"
                    : "text"
                }
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                required
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? "در حال ارسال..." : "ارسال"}
          </button>

          {message && (
            <p className="text-center mt-2 text-sm text-green-600">{message}</p>
          )}
        </form>
      )}
    </div>
  );
};

export default ResidentialForm;
