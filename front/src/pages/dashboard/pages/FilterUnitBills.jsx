// src/components/Units/FilterUnitBills.jsx (adjust path as needed)

import React from "react";

const FilterUnitBills = ({
  filterYear,
  setFilterYear,
  filterMonth,
  setFilterMonth,
  years, // Receive years array as prop
  months, // Receive month names array as prop
}) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row justify-center items-center gap-4">
      <div className="flex items-center gap-2 w-full md:w-auto">
        <label
          htmlFor="filterYear"
          className="text-sm font-medium text-gray-700"
        >
          فیلتر سال:
        </label>
        <select
          id="filterYear"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm w-full md:w-32"
        >
          <option value="">همه سال‌ها</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2 w-full md:w-auto">
        <label
          htmlFor="filterMonth"
          className="text-sm font-medium text-gray-700"
        >
          فیلتر ماه:
        </label>
        <select
          id="filterMonth"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm w-full md:w-32"
        >
          <option value="">همه ماه‌ها</option>
          {months.map((month, index) => (
            <option key={index + 1} value={index + 1}>
              {month}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={() => {
          setFilterYear("");
          setFilterMonth("");
        }}
        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 text-sm transition-colors w-full md:w-auto"
      >
        پاک کردن فیلترها
      </button>
    </div>
  );
};

export default FilterUnitBills;
