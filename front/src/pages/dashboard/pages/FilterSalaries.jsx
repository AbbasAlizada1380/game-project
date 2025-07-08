// src/components/FilterSalaries.js (or appropriate path)
import React from "react";

function FilterSalaries({
  filterYear,
  setFilterYear,
  filterMonth,
  setFilterMonth,
  years, // Array of year numbers/strings
  months, // Array of month names like ["حمل", "ثور", ...]
}) {
  return (
    // Minimal styling to blend in, similar layout to previous filter components
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-3 text-center text-gray-700">
        فیلتر معاشات
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {" "}
        {/* Adjusted grid for 2 items */}
        {/* Filter by Year */}
        <div>
          <label
            htmlFor="filterSalaryYear" // Use unique ID if necessary
            className="block text-sm text-gray-700 font-bold mb-1 text-right"
          >
            سال:
          </label>
          <select
            id="filterSalaryYear"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white text-right" // Style consistent with form inputs
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="">همه سال‌ها</option>
            {years.map((year) => (
              <option key={year} value={String(year)}>
                {year}
              </option>
            ))}
          </select>
        </div>
        {/* Filter by Month */}
        <div>
          <label
            htmlFor="filterSalaryMonth" // Use unique ID if necessary
            className="block text-sm text-gray-700 font-bold mb-1 text-right"
          >
            ماه:
          </label>
          <select
            id="filterSalaryMonth"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white text-right"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="">همه ماه‌ها</option>
            {/* Map over month names, using index+1 as value */}
            {months.map((monthName, index) => (
              <option key={index} value={String(index + 1)}>
                {monthName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default FilterSalaries;
