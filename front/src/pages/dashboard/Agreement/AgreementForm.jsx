// Path: src/components/Agreement/AgreementForm.js (Adjust path as needed)
import React, { useState, useEffect, useCallback, useRef } from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { floors } from "../ServiceManager/Hook/rentConstant";

const AgreementForm = ({
  customers = [], // Default to empty array
  onSubmit,
  initialValues = {}, // Default to empty object
  onCancel,
  isLoading = false, // Default to false
}) => {
  const [formData, setFormData] = useState({
    customer: "",
    status: "Active",
    shop: "",
    rant: "", // Corresponds to API 'rent'
    service: "", // Corresponds to API 'services'
    floor: "0",
    advance: "",
  });
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); // Ref for detecting clicks outside

  // Effect to update form when initialValues change (e.g., when editing)
  useEffect(() => {
    // Ensure initialValues has properties before spreading
    if (initialValues && Object.keys(initialValues).length > 0) {
      // Map initialValues fields to formData fields
      setFormData({
        customer: initialValues.customer ?? "",
        status: initialValues.status ?? "Active",
        shop: initialValues.shop ?? "", // Expecting string here from parent prep
        rant: initialValues.rant ?? "", // Map 'rant' from prepared initialValues
        service: initialValues.service ?? "", // Map 'service'
        floor: initialValues.floor ?? "0",
        advance: initialValues.advance ?? "",
        // Do NOT include the 'id' in the state managed by the form
      });
      // Pre-fill search term if editing? Optional.
      const currentCustomer = customers.find(
        (c) => c.id === initialValues.customer
      );
      // setCustomerSearchTerm(currentCustomer ? currentCustomer.name : "");
    } else {
      // Reset form if initialValues is empty (e.g., for adding new)
      setFormData({
        customer: "",
        status: "Active",
        shop: "",
        rant: "",
        service: "",
        floor: "0",
        advance: "",
      });
      setCustomerSearchTerm(""); 
    }
  }, [initialValues, customers]); 

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCustomerDropdownOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleChange = (e) => { 
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customer) {
      alert("لطفا یک مشتری انتخاب کنید."); // Basic validation
      return;
    }
    // Parent component (Agreements.js) handles mapping 'rant'/'service' back before sending to API
    onSubmit(formData);
  };

  // Memoize filtered customers calculation
  const filteredCustomers = useCallback(() => {
    if (!customers) return []; // Handle case where customers might not be loaded yet
    const lowerSearchTerm = customerSearchTerm.toLowerCase();
    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(lowerSearchTerm)
    );
  }, [customers, customerSearchTerm]);

  const handleCustomerSelect = (customerId) => {
    setFormData({ ...formData, customer: customerId });
    // Optionally clear search term after selection
    // const selected = customers.find(c => c.id === customerId);
    // setCustomerSearchTerm(selected ? selected.name : "");
    setIsCustomerDropdownOpen(false);
  };

  const toggleCustomerDropdown = (e) => {
    e.stopPropagation(); // Prevent click from closing immediately via document listener
    setIsCustomerDropdownOpen(!isCustomerDropdownOpen);
  };

  const selectedCustomerName =
    customers.find((c) => c.id === formData.customer)?.name || "انتخاب مشتری";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 md:space-y-6 p-6 md:p-8 w-full mx-auto" // Adjusted padding
    >
      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Column 1 */}
        <div className="space-y-4">
          {/* Customer Select */}
          <div>
            <label
              htmlFor="customer-button"
              className="block font-medium text-sm text-gray-700 mb-1"
            >
              مشتری: <span className="text-red-500">*</span>
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                id="customer-button"
                type="button"
                className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-right cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                onClick={toggleCustomerDropdown}
                aria-haspopup="listbox"
                aria-expanded={isCustomerDropdownOpen}
              >
                <span className="block truncate">{selectedCustomerName}</span>
                <span className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                  <FiChevronDown
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </button>

              {/* Customer Dropdown */}
              {isCustomerDropdownOpen && (
                <div className="absolute mt-1 w-full bg-white rounded-md shadow-lg z-20 max-h-60 ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {/* Search Input */}
                  <div className="sticky top-0 bg-white z-10 px-2 pt-2 pb-1">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="جستجوی مشتری..."
                        className="w-full border border-gray-300 rounded-md py-1.5 px-3 pl-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        value={customerSearchTerm}
                        onChange={(e) => setCustomerSearchTerm(e.target.value)}
                        autoFocus
                      />
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                  </div>

                  {/* Customer List */}
                  <ul role="listbox">
                    {filteredCustomers().length > 0 ? (
                      filteredCustomers().map((customer) => (
                        <li
                          key={customer.id}
                          className="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-indigo-100 hover:text-indigo-900"
                          role="option"
                          onClick={() => handleCustomerSelect(customer.id)}
                        >
                          <span className="font-normal block truncate">
                            {customer.name}
                          </span>
                          {/* Optional: Checkmark for selected */}
                          {formData.customer === customer.id && (
                            <span className="text-indigo-600 absolute inset-y-0 left-0 flex items-center pl-1.5">
                              {/* Check icon */}
                              <svg
                                className="h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          )}
                        </li>
                      ))
                    ) : (
                      <li className="p-3 text-center text-gray-500 text-sm">
                        مشتری یافت نشد
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Status Select */}
          <div>
            <label
              htmlFor="status"
              className="block font-medium text-sm text-gray-700 mb-1"
            >
              وضعیت:
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white"
            >
              <option value="Active">فعال</option>
              <option value="InActive">غیرفعال</option>
            </select>
          </div>

          {/* Shop Input */}
          <div>
            <label
              htmlFor="shop"
              className="block font-medium text-sm text-gray-700 mb-1"
            >
              دکان (نمبر یا نام):
            </label>
            <input
              id="shop"
              name="shop"
              type="text"
              placeholder="مثال: 101, 102"
              value={formData.shop}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              در صورت متعدد بودن با کاما (,) جدا کنید.
            </p>
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-4">
          {/* Rent Input */}
          <div>
            <label
              htmlFor="rant"
              className="block font-medium text-sm text-gray-700 mb-1"
            >
              کرایه ماهوار: <span className="text-red-500">*</span>
            </label>
            <input
              id="rant"
              name="rant"
              type="number"
              value={formData.rant}
              onChange={handleChange}
              placeholder="مقدار عددی کرایه"
              required
              min="0" // Ensure non-negative
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Service Input */}
          <div>
            <label
              htmlFor="service"
              className="block font-medium text-sm text-gray-700 mb-1"
            >
              خدمات ماهوار: <span className="text-red-500">*</span>
            </label>
            <input
              id="service"
              name="service"
              type="number"
              value={formData.service}
              onChange={handleChange}
              placeholder="مقدار عددی خدمات"
              required
              min="0"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Floor Select */}
          <div>
            <label
              htmlFor="floor"
              className="block font-medium text-sm text-gray-700 mb-1"
            >
              منزل:
            </label>
            <select
              id="floor"
              name="floor"
              value={formData.floor}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white"
            >
              {floors.map((floor) => (
                <option key={floor.value} value={floor.value}>
                  {floor.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>{" "}
      {/* End Grid */}
      {/* Advance Payment (Centered) */}
      <div className="pt-4">
        {" "}
        {/* Added padding top */}
        <label
          htmlFor="advance"
          className="block text-center font-medium text-sm text-gray-700 mb-1"
        >
          پیش پرداخت (اختیاری):
        </label>
        <div className="flex justify-center">
          <input
            id="advance"
            name="advance"
            type="number"
            value={formData.advance}
            onChange={handleChange}
            placeholder="مقدار پیش پرداخت"
            min="0"
            className="mt-1 block w-full md:w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex justify-center items-center gap-x-4 pt-5">
        <button
          type="submit"
          disabled={isLoading}
          className={`inline-flex justify-center items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out ${
            isLoading
              ? "bg-indigo-300 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
          }`}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white rtl:mr-0 rtl:-mr-1 rtl:ml-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              در حال ذخیره...
            </>
          ) : initialValues.customer ? (
            "ذخیره تغییرات"
          ) : (
            "ثبت قرارداد"
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="inline-flex justify-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-150 ease-in-out"
        >
          انصراف
        </button>
      </div>
    </form>
  );
};

export default AgreementForm;
