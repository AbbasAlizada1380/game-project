// src/components/FilterIncomes.js (or appropriate path)
import React from "react";

// We need the 'years' array generation logic or pass 'years' as a prop
// Let's assume 'years' and 'months' are passed as props for simplicity here

function FilterIncomes({
  filterYear,
  setFilterYear,
  filterMonth,
  setFilterMonth,
  years, // Array of year numbers/strings
  months, // Array of { value, label } objects
}) {
  return (
    // Minimal styling to blend in, similar layout to previous filter components
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-3 text-center text-gray-700">
        فیلتر درآمدها
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {" "}
        {/* Adjusted grid for 2 items */}
        {/* Filter by Year */}
        <div>
          <label
            htmlFor="filterIncomeYear" // Use unique ID if necessary
            className="block text-sm text-gray-700 font-bold mb-1 text-right"
          >
            سال:
          </label>
          <select
            id="filterIncomeYear"
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
            htmlFor="filterIncomeMonth" // Use unique ID if necessary
            className="block text-sm text-gray-700 font-bold mb-1 text-right"
          >
            ماه:
          </label>
          <select
            id="filterIncomeMonth"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white text-right"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="">همه ماه‌ها</option>
            {months.map((month) => (
              // Use month.value for consistency if backend uses numeric month
              <option key={month.value} value={String(month.value)}>
                {month.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default FilterIncomes;
