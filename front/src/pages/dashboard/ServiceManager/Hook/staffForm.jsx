import React, { useState, useEffect } from "react";

const StaffForm = ({ onSubmit, editingId, staffData, setStaffData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStaffData({ ...staffData, [name]: value });
  };

  const handleFileChange = (e) => {
    setStaffData({ ...staffData, photo: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto space-y-4"
    >
      <input
        type="text"
        name="name"
        value={staffData.name}
        onChange={handleChange}
        placeholder="نام"
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="father_name"
        value={staffData.father_name}
        onChange={handleChange}
        placeholder="نام پدر"
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="nic"
        value={staffData.nic}
        onChange={handleChange}
        placeholder="شماره تذکره"
        className="w-full p-2 border rounded"
      />
      <input
        type="file"
        name="photo"
        onChange={handleFileChange}
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="address"
        value={staffData.address}
        onChange={handleChange}
        placeholder="آدرس"
        className="w-full p-2 border rounded"
      />
      <select
        name="position"
        value={staffData.position}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="">انتخاب موقعیت</option>
        <option value="Gard">نگهبان</option>
        <option value="Manager">مدیر</option>
        <option value="Electrical">برقکار</option>
        <option value="Cleaner">نظافتچی</option>
        <option value="Cooker">آشپز</option>
        <option value="Other">دیگر</option>
      </select>
      <input
        type="number"
        name="salary"
        value={staffData.salary}
        onChange={handleChange}
        placeholder="حقوق"
        className="w-full p-2 border rounded"
      />
      <select
        name="status"
        value={staffData.status}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="">انتخاب وضعیت</option>
        <option value="Active">فعال</option>
        <option value="InActive">غیرفعال</option>
      </select>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        {editingId ? "به روزرسانی کارمند" : "ثبت کارمند"}
      </button>
    </form>
  );
};

export default StaffForm;
