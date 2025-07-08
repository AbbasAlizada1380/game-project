import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FiUploadCloud, FiXCircle } from "react-icons/fi"; // Using different icons

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_URL = `${BASE_URL}/api/customers/`;

// Helper to get filename from URL
const getFilenameFromUrl = (url) => {
  if (!url) return "";
  try {
    return url.substring(url.lastIndexOf("/") + 1);
  } catch {
    return "file";
  }
};

export const CustomerForm = ({
  editingCustomer,
  onSuccess,
  onError,
  onCancel,
}) => {
  // State for text form fields
  const [formData, setFormData] = useState({
    name: "",
    father_name: "",
    phone_number: "",
    rental_owner: "",
    address: "",
    nic: "",
  });

  // State for the *newly selected* attachment file (File object)
  const [selectedAttachmentFile, setSelectedAttachmentFile] = useState(null);
  // State for preview URL (only if the selected file is an image)
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  // State to track if the user wants to remove the existing attachment
  const [removeExistingAttachment, setRemoveExistingAttachment] =
    useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editingCustomer) {
      // Populate text fields
      setFormData({
        name: editingCustomer.name || "",
        father_name: editingCustomer.father_name || "",
        phone_number: editingCustomer.phone_number || "",
        rental_owner: editingCustomer.rental_owner || "",
        address: editingCustomer.address || "",
        nic: editingCustomer.nic || "",
        // Do NOT put attachment URL here, handle separately
      });
      // Reset file state for edit mode
      setSelectedAttachmentFile(null);
      setImagePreviewUrl(null);
      setRemoveExistingAttachment(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      // Reset form for creating a new customer
      setFormData({
        name: "",
        father_name: "",
        phone_number: "",
        rental_owner: "",
        address: "",
        nic: "",
      });
      setSelectedAttachmentFile(null);
      setImagePreviewUrl(null);
      setRemoveExistingAttachment(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    // IMPORTANT: Depend only on editingCustomer ID or a similar stable prop
    // to avoid re-renders if the parent passes a slightly different object ref
  }, [editingCustomer?.id]); // Rerun effect only when the customer ID changes

  // Handles changes for text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handles changes for the file input
  const handleAttachmentChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedAttachmentFile(file); // Store the actual File object
      setRemoveExistingAttachment(false); // Selecting a new file overrides removal intent

      // Create and set a preview URL if it's an image
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviewUrl(reader.result); // Show preview
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreviewUrl(null); // Not an image, clear preview
      }
    } else {
      // Case where user cancels file selection might need specific handling
      // This logic might depend if you want to revert to original or just clear selection
      // For simplicity, we just clear the selection state here
      setSelectedAttachmentFile(null);
      setImagePreviewUrl(null);
    }
  };

  // Handler to mark existing attachment for removal
  const handleRemoveExistingAttachment = () => {
    setRemoveExistingAttachment(true);
    setSelectedAttachmentFile(null); // Clear any newly selected file too
    setImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input visually
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      // Append all standard text/number fields from formData state
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Handle the attachment field
      if (selectedAttachmentFile) {
        // A new file was selected, append it
        formDataToSend.append(
          "attachment",
          selectedAttachmentFile,
          selectedAttachmentFile.name
        );
      } else if (removeExistingAttachment && editingCustomer?.attachment) {
        // No new file selected, but user wants to remove existing one
        formDataToSend.append("attachment", ""); // Send empty string to clear FileField on backend
      }
      // If neither of the above conditions is met (editing, no new file, didn't click remove),
      // the 'attachment' key is not sent, and the backend (using PATCH) won't change the existing file.

      const url = editingCustomer
        ? `${API_URL}${editingCustomer.id}/`
        : API_URL;
      // Use PATCH for updates (more efficient for file fields), POST for creates
      const method = editingCustomer ? "patch" : "post";

      await axios({
        method: method,
        url: url,
        data: formDataToSend,
        headers: { "Content-Type": "multipart/form-data" }, // Crucial for file uploads
      });

      const successMessage = editingCustomer
        ? "دوکاندار موفقانه ویرایش شد!"
        : "دوکاندار موفقانه اضافه شد!";
      if (onSuccess) {
        onSuccess(successMessage); // Notify parent
      }
    } catch (error) {
      console.error("Error saving customer:", error.response || error);
      let errorMsg = editingCustomer
        ? "خطا در ویرایش دوکاندار."
        : "خطا در افزودن دوکاندار.";

      // Extract more specific errors from backend response if available
      if (error.response && error.response.data) {
        let backendErrors = [];
        const errorData = error.response.data;

        // Handle different DRF error formats
        if (errorData.detail) {
          backendErrors.push(errorData.detail);
        } else if (typeof errorData === "object") {
          backendErrors = Object.entries(errorData).map(
            ([key, value]) =>
              `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
          );
        } else if (typeof errorData === "string") {
          backendErrors.push(errorData);
        }

        if (backendErrors.length > 0) {
          errorMsg += ` (${backendErrors.join(" | ")})`;
        } else {
          errorMsg += " لطفا دوباره تلاش کنید.";
        }
      } else {
        errorMsg += " لطفا دوباره تلاش کنید.";
      }

      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine the text for the file input label based on selection
  const fileInputLabelText = selectedAttachmentFile
    ? selectedAttachmentFile.name
    : "برای آپلود کلیک کنید یا فایل را اینجا بکشید";

  // Get info about the existing attachment for display
  const existingAttachmentUrl = editingCustomer?.attachment;
  const existingAttachmentType = editingCustomer?.attachment_type;
  const showExistingAttachmentInfo =
    existingAttachmentUrl &&
    !removeExistingAttachment &&
    !selectedAttachmentFile;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl mx-auto bg-gray-200 p-10 rounded-lg text-right shadow-md"
    >
      <h3 className="text-xl font-semibold text-center text-gray-800 mb-6">
        {editingCustomer ? "ویرایش معلومات دوکاندار" : "فورم ثبت دوکاندار جدید"}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* --- Text Input Fields (Same as before) --- */}
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            نام: <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="نام کامل دوکاندار"
            required
            className="appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-800 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        {/* Father Name */}
        <div>
          <label
            htmlFor="father_name"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            نام پدر:
          </label>
          <input
            id="father_name"
            type="text"
            name="father_name"
            value={formData.father_name}
            onChange={handleChange}
            placeholder="نام پدر دوکاندار"
            className="appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-800 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        {/* Phone */}
        <div>
          <label
            htmlFor="phone_number"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            شماره تماس:
          </label>
          <input
            id="phone_number"
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="مثال: 07xxxxxxxx"
            className="appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-800 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            dir="ltr"
          />
        </div>
        {/* NIC */}
        <div>
          <label
            htmlFor="nic"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            نمبر تذکره: <span className="text-red-500">*</span>
          </label>
          <input
            id="nic"
            type="text"
            name="nic"
            value={formData.nic}
            onChange={handleChange}
            placeholder="نمبر تذکره الکترونیکی یا کاغذی"
            required
            className="appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-800 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            dir="ltr"
          />
        </div>
        {/* Rental Owner */}
        <div>
          <label
            htmlFor="rental_owner"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            نام مالک کرایه دهنده:
          </label>
          <input
            id="rental_owner"
            type="text"
            name="rental_owner"
            value={formData.rental_owner}
            onChange={handleChange}
            placeholder="نام مالک مکان کرایه شده"
            className="appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-800 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        {/* Address */}
        <div>
          <label
            htmlFor="address"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            آدرس دقیق:
          </label>
          <input
            id="address"
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="ناحیه، گذر، سرک، نمبر دوکان/منزل"
            className="appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-800 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* --- Attachment Upload and Preview --- */}
      <div className="mt-6 flex flex-col items-center">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          فایل ضمیمه (عکس، PDF، سند):
        </label>

        {/* Display Existing Attachment Info (if applicable) */}
        {showExistingAttachmentInfo && (
          <div className="mb-3 p-2 border rounded bg-white w-full md:w-3/4 lg:w-1/2 text-center">
            <p className="text-sm text-gray-600 mb-1">فایل فعلی:</p>
            {existingAttachmentType === "image" ? (
              <img
                src={existingAttachmentUrl}
                alt="Existing Attachment"
                className="h-16 w-16 object-cover rounded inline-block"
              />
            ) : (
              <a
                href={existingAttachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all text-sm"
                title={`دانلود ${getFilenameFromUrl(existingAttachmentUrl)}`}
              >
                {existingAttachmentType === "pdf" ? "📄" : "📎"}{" "}
                {getFilenameFromUrl(existingAttachmentUrl)}
              </a>
            )}
            <button
              type="button"
              onClick={handleRemoveExistingAttachment}
              className="ml-3 text-red-500 hover:text-red-700 text-xs font-semibold"
              title="حذف فایل فعلی"
            >
              <FiXCircle className="inline w-4 h-4 mr-1" /> حذف
            </button>
          </div>
        )}

        {/* Display New File Preview / Info (if applicable) */}
        {selectedAttachmentFile && (
          <div className="mb-3 p-2 border rounded bg-white w-full md:w-3/4 lg:w-1/2 text-center">
            <p className="text-sm text-gray-600 mb-1">فایل جدید انتخاب شده:</p>
            {imagePreviewUrl ? (
              <img
                src={imagePreviewUrl}
                alt="New Attachment Preview"
                className="h-16 w-16 object-cover rounded inline-block"
                // No need for onload revoke here as it's managed by state
              />
            ) : (
              <p className="text-sm text-gray-700 italic">
                📎 {selectedAttachmentFile.name} (
                {(selectedAttachmentFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        )}

        {/* File Input Area (only show if not removing existing without replacement) */}
        {!(removeExistingAttachment && !selectedAttachmentFile) && (
          <div className="w-full md:w-3/4 lg:w-1/2">
            <label
              htmlFor="attachmentUpload"
              className={`flex flex-col items-center justify-center w-full h-32 px-4 transition bg-white border-2 ${
                selectedAttachmentFile ? "border-green-400" : "border-gray-300"
              } border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            >
              <span className="flex items-center space-x-2 rtl:space-x-reverse">
                <FiUploadCloud className="w-6 h-6 text-gray-600" />
                <span
                  className={`font-medium ${
                    selectedAttachmentFile ? "text-green-700" : "text-gray-600"
                  }`}
                >
                  {fileInputLabelText}
                </span>
              </span>
              <span className="text-xs text-gray-500 mt-1">
                عکس ها، PDF، فایل های ورد/اکسل مجاز است (حداکثر 5MB)
              </span>
              <input
                type="file"
                id="attachmentUpload"
                name="attachment" // Matches backend field
                onChange={handleAttachmentChange}
                // Loosen accept or specify allowed types
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                ref={fileInputRef}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* --- Action Buttons (Same as before) --- */}
      <div className="mt-8 flex justify-center items-center gap-x-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`py-2 px-6 rounded-md text-white font-semibold transition-colors duration-200 ease-in-out ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          }`}
        >
          {/* Loading/Submit Text */}
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              {" "}
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                {" "}
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>{" "}
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>{" "}
              </svg>{" "}
              در حال ذخیره...{" "}
            </div>
          ) : editingCustomer ? (
            "ذخیره تغییرات"
          ) : (
            "ثبت دوکاندار"
          )}
        </button>
        <button
          onClick={onCancel} // Use prop directly
          type="button"
          disabled={isSubmitting}
          className="py-2 px-6 rounded-md text-white font-semibold bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 ease-in-out disabled:opacity-50"
        >
          انصراف
        </button>
      </div>
    </form>
  );
};
