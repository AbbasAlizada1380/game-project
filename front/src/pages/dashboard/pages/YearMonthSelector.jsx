// src/components/YearMonthSelector.js
import React from "react";

const YearMonthSelector = ({
  selectedYear,
  selectedMonth,
  years,
  shamsiMonths,
  onYearSelect,
  onMonthSelect,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label
          htmlFor="year"
          className="block text-right text-gray-700 text-sm font-bold mb-2"
        >
          سال:
        </label>
        <select
          id="year"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-right"
          value={selectedYear}
          onChange={onYearSelect}
        >
          <option value="">انتخاب سال</option>
          {years.map((year) => (
            <option key={year} value={String(year)}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="month"
          className="block text-right text-gray-700 text-sm font-bold mb-2"
        >
          ماه:
        </label>
        <select
          id="month"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-right"
          value={selectedMonth}
          onChange={onMonthSelect}
        >
          <option value="">انتخاب ماه</option>
          {shamsiMonths.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default YearMonthSelector;
