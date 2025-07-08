// CustomerModal.jsx
import React from "react";

const CustomerModal = ({ customer, onClose }) => {
  if (!customer) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">Customer Details</h3>
        <p>
          <strong>Name:</strong> {customer.name}
        </p>
        <p>
          <strong>Email:</strong> {customer.father_name}
        </p>
        <p>
          <strong>Phone:</strong> {customer.phone_number}
        </p>
        <p>
          <strong>Address:</strong> {customer.id_card}
        </p>
        <button
          className="mt-4 bg-red-500 text-white py-1 px-3 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CustomerModal;
