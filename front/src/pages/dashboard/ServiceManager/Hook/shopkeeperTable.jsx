import React from "react";
import { FaRegEdit, FaFilePdf, FaFileAlt, FaImage } from "react-icons/fa"; // Added file icons
import { MdDeleteForever } from "react-icons/md";

// Helper to get filename from URL
const getFilenameFromUrl = (url) => {
  if (!url) return "";
  try {
    // Decode URI component in case of encoded chars in filename
    return decodeURIComponent(url.substring(url.lastIndexOf("/") + 1));
  } catch {
    return "file"; // Fallback
  }
};

export const CustomerTable = ({ customers, handleEdit, handleDelete }) => (
  <div className="overflow-x-auto shadow-md rounded-lg">
    {" "}
    {/* Added container for responsiveness */}
    <table className="w-full min-w-[800px] bg-white rounded-lg overflow-hidden">
      {" "}
      {/* Added min-width */}
      <thead>
        <tr className="bg-primary text-white text-md font-semibold uppercase tracking-wider text-center">
          <th className="border px-4 py-3">قرارار داد</th>
          <th className="border px-4 py-3">نام</th>
          <th className="border px-4 py-3">نام پدر</th>
          <th className="border px-4 py-3">شماره تماس</th>
          <th className="border px-4 py-3">مالک کرایه</th>
          <th className="border px-4 py-3">آدرس</th>
          <th className="border px-4 py-3">تذکره</th>
          <th className="border px-4 py-3">عملیات</th>
        </tr>
      </thead>
      <tbody className="text-gray-700">
        {customers.map((customer) => (
          <tr
            key={customer.id}
            className="border-b border-gray-300 text-center hover:bg-gray-100 transition-colors duration-150"
          >
            {/* --- Attachment Column --- */}
            <td className="border px-2 py-2 text-center align-middle">
              {customer.attachment ? (
                // Conditionally render based on attachment_type
                customer.attachment_type === "image" ? (
                  <a
                    href={customer.attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="مشاهده تصویر"
                  >
                    <img
                      src={customer.attachment} // Use the attachment URL directly
                      alt={customer.name}
                      className="w-10 h-10 object-cover rounded-full border border-gray-300 inline-block"
                    />
                  </a>
                ) : (
                  // Link for non-image files
                  <a
                    href={customer.attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    title={`دانلود ${getFilenameFromUrl(customer.attachment)}`}
                  >
                    {/* Show specific icon based on type */}
                    {customer.attachment_type === "pdf" ? (
                      <FaFilePdf
                        size={24}
                        className="inline-block text-red-600"
                      />
                    ) : (
                      <FaFileAlt
                        size={24}
                        className="inline-block text-gray-600"
                      />
                    )}
                  </a>
                )
              ) : (
                <span className="text-gray-400 text-xs italic">ندارد</span>
              )}
            </td>
            <td className="border px-4 py-3 font-medium">{customer.name}</td>
            <td className="border px-4 py-3">{customer.father_name}</td>
            <td className="border px-4 py-3" dir="ltr">
              {customer.phone_number}
            </td>
            <td className="border px-4 py-3">{customer.rental_owner}</td>
            <td className="border px-4 py-3 text-sm">{customer.address}</td>
            <td className="border px-4 py-3" dir="ltr">
              {customer.nic}
            </td>
            <td className="border px-4 py-3">
              <div className="flex justify-center items-center gap-x-3">
                {" "}
                <button
                  onClick={() => handleEdit(customer)}
                  className="text-green-600 hover:text-green-800 transition-colors duration-200 transform hover:scale-110"
                  title="ویرایش"
                >
                  <FaRegEdit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(customer.id)}
                  className="text-red-600 hover:text-red-800 transition-colors duration-200 transform hover:scale-110"
                  title="حذف"
                >
                  <MdDeleteForever size={22} />
                </button>
              </div>
            </td>
          </tr>
        ))}
        {customers.length === 0 && (
          <tr>
            <td colSpan="8" className="text-center py-4 text-gray-500 italic">
              هیچ دوکانداری یافت نشد.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);
