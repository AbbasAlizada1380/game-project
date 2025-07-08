// ConfirmToast.jsx (or place it within a relevant component file if preferred)
import React from "react";

// Reusable Confirmation Toast Component (Persian)
const ConfirmToast = ({ closeToast, message, onConfirm }) => (
  <div>
    <p className="mb-3 font-semibold">{message}</p>
    <div className="flex justify-end gap-3">
      <button
        onClick={() => {
          onConfirm(); // Execute the confirmation action
          closeToast(); // Close the toast
        }}
        className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-4 rounded transition-colors"
      >
        بلی، حذف کن
      </button>
      <button
        onClick={closeToast} 
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-medium py-1 px-4 rounded transition-colors"
      >
        لغو
      </button>
    </div>
  </div>
);

export default ConfirmToast;
