import React from "react";

const StaffTable = ({ staffList, onEdit, onDelete }) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-center">فهرست کارمندان</h2>
      <table className="w-full mt-4 border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">نام</th>
            <th className="border p-2">موقعیت</th>
            <th className="border p-2">حقوق</th>
            <th className="border p-2">تصویر</th> {/* Added image column */}
            <th className="border p-2">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {staffList.map((staff) => (
            <tr key={staff.id} className="border">
              <td className="border p-2">{staff.name}</td>
              <td className="border p-2">
                {staff.position === "Gard" && "نگهبان"}
                {staff.position === "Manager" && "مدیر"}
                {staff.position === "Electrical" && "برقکار"}
                {staff.position === "Cleaner" && "نظافتچی"}
                {staff.position === "Cooker" && "آشپز"}
                {staff.position === "Other" && "دیگر"}
              </td>
              <td className="border p-2">{staff.salary}</td>

              {/* Display staff photo */}
              <td className="border p-2">
                {staff.photo ? (
                  <img
                    src={`${staff.photo}`} // Assuming the image is stored and served from the server
                    alt={staff.name}
                    className="w-16 h-16 object-cover rounded-full"
                  />
                ) : (
                  <span>بدون تصویر</span> // No image available
                )}
              </td>

              <td className="border p-2 space-x-2">
                <button
                  onClick={() => onEdit(staff)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  ویرایش
                </button>
                <button
                  onClick={() => onDelete(staff.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffTable;
