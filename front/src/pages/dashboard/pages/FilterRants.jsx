// src/components/FilterRants.js
import React from "react";
import { floors } from "../ServiceManager/Hook/rentConstant"; // Assuming floors is still needed here, though months is primary for this change

// Props will change: filterMonth/setFilterMonth will be replaced by start/end month props
function FilterRants({
  filterYear,
  setFilterYear,
  filterStartMonth, // New: prop for start month label
  setFilterStartMonth, // New: setter for start month label
  filterEndMonth, // New: prop for end month label
  setFilterEndMonth, // New: setter for end month label
  filterFloor,
  setFilterFloor,
  years,
  months, // months array [{label: "حمل", value: "1"}, ...]
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-2 text-right">فیلتر کرایه‌ها</h3>
      {/* Updated grid to accommodate potentially 4 filters: Year, StartMonth, EndMonth, Floor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label
            htmlFor="filterYear"
            className="block text-right text-gray-700 text-md font-bold mb-2"
          >
            سال:
          </label>
          <select
            id="filterYear"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-right"
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

        {/* Start Month Filter */}
        <div>
          <label
            htmlFor="filterStartMonth"
            className="block text-right text-gray-700 text-md font-bold mb-2"
          >
            از ماه:
          </label>
          <select
            id="filterStartMonth"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-right"
            value={filterStartMonth} // Uses the new state variable for start month label
            onChange={(e) => setFilterStartMonth(e.target.value)} // Sets the start month label
          >
            <option value="">انتخاب ماه شروع</option>
            {months.map((month) => (
              <option key={`start-${month.label}`} value={month.label}>
                {" "}
                {/* Value is the month label */}
                {month.label}
              </option>
            ))}
          </select>
        </div>

        {/* End Month Filter */}
        <div>
          <label
            htmlFor="filterEndMonth"
            className="block text-right text-gray-700 text-md font-bold mb-2"
          >
            تا ماه:
          </label>
          <select
            id="filterEndMonth"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-right"
            value={filterEndMonth} // Uses the new state variable for end month label
            onChange={(e) => setFilterEndMonth(e.target.value)} // Sets the end month label
          >
            <option value="">انتخاب ماه پایان</option>
            {months.map((month) => (
              <option key={`end-${month.label}`} value={month.label}>
                {" "}
                {/* Value is the month label */}
                {month.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="filterFloor"
            className="block text-right text-gray-700 text-md font-bold mb-2"
          >
            طبقه:
          </label>
          <select
            id="filterFloor"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-right"
            value={filterFloor}
            onChange={(e) => setFilterFloor(e.target.value)}
          >
            <option value="">همه طبقات</option>
            {floors.map((floor) => (
              <option key={floor.value} value={String(floor.value)}>
                {floor.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default FilterRants;
