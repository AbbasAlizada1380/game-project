// src/hooks/useYearMonth.js
import { useState } from "react";

const useYearMonth = (initialYear = "", initialMonth = "") => {
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);

  const startYear = 1400;
  const endYear = 1430; // Consider making these configurable
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );

  const shamsiMonths = [
    "حمل",
    "ثور",
    "جوزا",
    "سرطان",
    "اسد",
    "سنبله",
    "میزان",
    "عقرب",
    "قوس",
    "جدی",
    "دلو",
    "حوت",
  ];

  const handleYearSelect = (e) => {
    setSelectedYear(e.target.value);
  };

  const handleMonthSelect = (e) => {
    setSelectedMonth(e.target.value);
  };

  // Function to get the month number based on shamsiMonths
  const getMonthNumber = () => {
    return shamsiMonths.indexOf(selectedMonth) + 1;
  };

  return {
    selectedYear,
    selectedMonth,
    years,
    shamsiMonths,
    handleYearSelect,
    handleMonthSelect,
    getMonthNumber,
    setSelectedYear,
    setSelectedMonth,
  };
};

export default useYearMonth;
