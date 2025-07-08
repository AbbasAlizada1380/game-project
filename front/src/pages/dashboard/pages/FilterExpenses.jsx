// src/components/FilterExpenses.js (or appropriate path)
import React from "react";

function FilterExpenses({
  filterYear,
  setFilterYear,
  filterMonth,
  setFilterMonth,
  filterFloor,
  setFilterFloor,
  years, // Array of year numbers/strings
  months, // Array of { value, label } objects
  floors, // Array of { value, label } objects
}) {
  return (
    // Use simple styling that blends in - similar layout to Rent filter
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-3 text-center text-gray-700">
        فیلتر مصارف
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Filter by Year */}
        <div>
          <label
            htmlFor="filterYear"
            className="block text-sm text-gray-700 font-bold mb-1 text-right" // Adjusted label style slightly for consistency if needed
          >
            سال:
          </label>
          <select
            id="filterYear"
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
            htmlFor="filterMonth"
            className="block text-sm text-gray-700 font-bold mb-1 text-right"
          >
            ماه:
          </label>
          <select
            id="filterMonth"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white text-right"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="">همه ماه‌ها</option>
            {months.map((month) => (
              <option key={month.value} value={String(month.value)}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Floor */}
        <div>
          <label
            htmlFor="filterFloor"
            className="block text-sm text-gray-700 font-bold mb-1 text-right"
          >
            طبقه:
          </label>
          <select
            id="filterFloor"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white text-right"
            value={filterFloor}
            onChange={(e) => setFilterFloor(e.target.value)}
          >
            <option value="">همه طبقات</option>
            {floors.map((floor) => (
              <option key={floor.value} value={floor.value}>
                {floor.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default FilterExpenses;
