import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  FiDownload,
  FiFilter,
  FiPrinter,
  FiSearch,
  FiUsers,
  FiClipboard,
  FiHome,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiBell, // Reminder icon (Rent/Service)
  FiUserMinus, // Added for Salary Reminder
  FiFileText, // Added for Unit Bills Reminder
} from "react-icons/fi";
const BASE_URL = import.meta.env.VITE_BASE_URL;
import { FaSpinner } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { jalaaliToGregorian, gregorianToJalaali } from "jalaali-js";

const API_BASE_URL = `${BASE_URL}`;
const ENDPOINTS = {
  EXPENDITURES: "/Expenditure/",
  EXPENDITURE_INCOME: "/Expenditure/income/",
  RENT: "/rent/",
  SERVICES: "/services/",
  SALARIES: "/staff/salaries/",
  CUSTOMERS: "/api/customers/",
  AGREEMENTS: "/agreements/",
  UNIT_BILLS: "/units/bills/",
  UNIT_FINANCES: "/units/finances/", // New endpoint for Unit Finances/Discounts
};

const ITEMS_PER_PAGE = 10;
const PIE_CHART_COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
  "#ffc658",
];

// --- Helper Functions (Formatting, Dates) --- //
const formatCurrency = (value, currency = "AFN") => {
  const options =
    currency === "AFN"
      ? {
          style: "currency",
          currency: "AFN",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }
      : { style: "currency", currency: "USD" };
  try {
    const numericValue =
      typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
    if (isNaN(numericValue)) return String(value || 0);
    return new Intl.NumberFormat("en-US", options).format(numericValue || 0);
  } catch (error) {
    console.error("Currency format error:", error);
    return String(value || 0);
  }
};

const getPersianMonthNameJalaali = (monthNumber) => {
  const months = [
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
  return months[monthNumber - 1] || `Month ${monthNumber}`;
};

const getPersianDate = (dateString) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      calendar: "persian",
      timeZone: "UTC",
      numberingSystem: "latn",
    };
    return date.toLocaleDateString("fa-IR", options);
  } catch (e) {
    console.error("Date format error:", dateString, e);
    return dateString;
  }
};

const shamsiToGregorianApprox = (jy, jm) => {
  if (
    !jy ||
    !jm ||
    isNaN(Number(jy)) ||
    isNaN(Number(jm)) ||
    Number(jm) < 1 ||
    Number(jm) > 12
  )
    return null;
  try {
    const { gy, gm, gd } = jalaaliToGregorian(Number(jy), Number(jm), 15);
    return new Date(Date.UTC(gy, gm - 1, gd));
  } catch (e) {
    console.error(`Error converting Shamsi ${jy}/${jm}:`, e);
    return null;
  }
};

const FinancialReports = () => {
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [endDate, setEndDate] = useState(new Date());
  const [reportType, setReportType] = useState("all");
  const [summaryData, setSummaryData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
  });
  const [extraSummary, setExtraSummary] = useState({
    totalCustomers: 0,
    activeAgreements: 0,
    activeShops: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [incomeSourceDistributionData, setIncomeSourceDistributionData] =
    useState([]);
  const [tableData, setTableData] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [customers, setCustomers] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [totalReminder, setTotalReminder] = useState(0);
  const [totalSalaryReminder, setTotalSalaryReminder] = useState(0);
  const [totalUnitBillsReminder, setTotalUnitBillsReminder] = useState(0);

  const getTransactionDate = (item) => {
    const standardDateFields = [
      "issue_date", // Added for UNIT_FINANCES (YYYY-MM-DD format)
      "payment_date",
      "transaction_date",
      "date",
      "created_at",
      "updated_at",
    ];
    for (const field of standardDateFields) {
      if (item?.[field] && typeof item[field] === "string") {
        try {
          // For "YYYY-MM-DD" strings, ensure it's treated as UTC to avoid timezone shifts
          let dateStr = item[field];
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            // Append time and Z to ensure UTC parsing if it's just a date
            dateStr = `${dateStr}T00:00:00Z`;
          }
          const date = new Date(dateStr);
          if (!isNaN(date.getTime()) && date.getUTCFullYear() > 1970)
            return date;
        } catch (e) {
          /* Ignore parse errors */
        }
      }
    }
    const year = item?.year ? Number(item.year) : NaN;
    const month = item?.month
      ? Number(item.month)
      : item?.time
      ? Number(item.time)
      : NaN;
    if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
      const gregorianDate = shamsiToGregorianApprox(year, month);
      if (gregorianDate) return gregorianDate;
    }
    return null;
  };

  const fetchReportData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAllTransactions([]);
    setIncomeSourceDistributionData([]);
    setTotalReminder(0);
    setTotalSalaryReminder(0);
    setTotalUnitBillsReminder(0);
    let localCustomers = {};

    const validStartDate =
      startDate instanceof Date && !isNaN(startDate)
        ? new Date(
            Date.UTC(
              startDate.getFullYear(),
              startDate.getMonth(),
              startDate.getDate(),
              0,
              0,
              0,
              0
            )
          )
        : new Date(
            Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)
          );
    const validEndDate =
      endDate instanceof Date && !isNaN(endDate)
        ? new Date(
            Date.UTC(
              endDate.getFullYear(),
              endDate.getMonth(),
              endDate.getDate(),
              23,
              59,
              59,
              999
            )
          )
        : new Date();

    const apiClient = axios.create({ baseURL: API_BASE_URL });

    const safeFetchData = async (url, params = {}) => {
      try {
        const response = await apiClient.get(url, {
          params: { ...params, page_size: 10000 },
        });
        const data = response.data?.results ?? response.data ?? [];
        return Array.isArray(data) ? data : [];
      } catch (error) {
        const status = error.response?.status;
        const errorData = error.response?.data;
        const detail =
          errorData?.detail ||
          errorData?.message ||
          (typeof errorData === "string" ? errorData : null);
        const message = error.message || "Unknown fetch error";
        const shortUrl = url.replace(API_BASE_URL, "").split("?")[0];
        let userMsg = `خطا در دریافت ${shortUrl}: `;
        if (status === 404) userMsg += "یافت نشد.";
        else if (message.includes("Network Error")) userMsg += "خطای شبکه.";
        else if (detail) userMsg += detail;
        else userMsg += message;
        console.error(
          `Error fetching ${url}:`,
          status,
          detail || message,
          error.response
        );
        setError((prev) => (prev ? `${prev}\n${userMsg}` : userMsg));
        return [];
      }
    };

    const filterItemByDate = (item) => {
      const transactionDate = getTransactionDate(item);
      return (
        transactionDate instanceof Date &&
        !isNaN(transactionDate.getTime()) &&
        transactionDate.getTime() >= validStartDate.getTime() &&
        transactionDate.getTime() <= validEndDate.getTime()
      );
    };

    try {
      const [
        expendituresData,
        expenditureIncomeData,
        rentData,
        serviceData,
        salaryData,
        customerData,
        agreementData,
        unitBillsData,
        unitFinancesData, // Fetched unit finances data
      ] = await Promise.all([
        safeFetchData(ENDPOINTS.EXPENDITURES),
        safeFetchData(ENDPOINTS.EXPENDITURE_INCOME),
        safeFetchData(ENDPOINTS.RENT),
        safeFetchData(ENDPOINTS.SERVICES),
        safeFetchData(ENDPOINTS.SALARIES),
        safeFetchData(ENDPOINTS.CUSTOMERS),
        safeFetchData(ENDPOINTS.AGREEMENTS),
        safeFetchData(ENDPOINTS.UNIT_BILLS),
        safeFetchData(ENDPOINTS.UNIT_FINANCES), // Fetch unit finances
      ]);

      localCustomers = customerData.reduce((acc, customer) => {
        if (customer?.id)
          acc[customer.id] =
            customer.full_name || customer.name || `مشتری ${customer.id}`;
        return acc;
      }, {});
      setCustomers(localCustomers);

      const activeAgreementsList = Array.isArray(agreementData)
        ? agreementData.filter((a) => a?.status === "Active")
        : [];
      const uniqueActiveShops = new Set();
      activeAgreementsList.forEach((agreement) => {
        const shopRef = agreement?.shop;
        if (Array.isArray(shopRef))
          shopRef.forEach((id) => id && uniqueActiveShops.add(id));
        else if (shopRef) uniqueActiveShops.add(shopRef);
      });
      setExtraSummary({
        totalCustomers: customerData.length,
        activeAgreements: activeAgreementsList.length,
        activeShops: uniqueActiveShops.size,
      });

      const filteredExpenditures = expendituresData.filter(filterItemByDate);
      const filteredExpenditureIncome =
        expenditureIncomeData.filter(filterItemByDate);
      const filteredRent = rentData.filter(filterItemByDate);
      const filteredService = serviceData.filter(filterItemByDate);
      const filteredSalary = salaryData.filter(filterItemByDate);
      const filteredUnitBills = unitBillsData.filter(filterItemByDate);
      const filteredUnitFinances = unitFinancesData.filter(filterItemByDate); // Filter unit finances

      let combined = [];
      let monthlyTotals = {};

      const addTransaction = (
        item,
        type,
        amountInput,
        date,
        description,
        category,
        sourceApi,
        relatedId = null,
        relatedEntity = null
      ) => {
        if (
          !item ||
          !type ||
          !date ||
          !(date instanceof Date) ||
          isNaN(date.getTime()) ||
          !sourceApi
        ) {
          console.warn("Skipping invalid transaction data:", {
            item,
            type,
            date,
            sourceApi,
          });
          return;
        }
        const amount = parseFloat(String(amountInput).replace(/,/g, "") || 0);
        if (isNaN(amount) || amount <= 0) return;

        let relatedName = "-";
        const customerLookup = localCustomers;
        if (
          relatedEntity === "customer" &&
          relatedId &&
          customerLookup[relatedId]
        ) {
          relatedName = customerLookup[relatedId];
        } else if (relatedEntity === "staff" && relatedId) {
          if (typeof item?.staff === "object" && item.staff?.name)
            relatedName = item.staff.name;
          else if (typeof item?.staff === "string" && item.staff)
            relatedName = item.staff;
          else if (
            item.customers_list &&
            relatedId &&
            item.customers_list[relatedId]?.name
          )
            relatedName = item.customers_list[relatedId].name;
          else if (String(relatedId).startsWith("ریکارد "))
            relatedName = "کارمندان (ریکارد کلی)";
          else relatedName = `کارمند ${relatedId}`;
        } else if (item?.receiver && !relatedId && !relatedEntity) {
          relatedName =
            typeof item.receiver === "string"
              ? item.receiver
              : `گیرنده ${item.receiver}`;
        } else if (relatedId) {
          relatedName = `ID: ${relatedId}`;
        }

        const catKey = (category || "unknown")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "_");
        const key = `${type}-${sourceApi}-${catKey}-${date.toISOString()}-${amount}-${Math.random()
          .toString(36)
          .substring(7)}`;
        combined.push({
          key,
          date: date.toISOString(),
          description: description || "-",
          category: category || "بدون کتگوری",
          amount,
          type,
          sourceApi,
          relatedName,
        });

        const monthKey = `${date.getUTCFullYear()}-${String(
          date.getUTCMonth() + 1
        ).padStart(2, "0")}`;
        if (!monthlyTotals[monthKey])
          monthlyTotals[monthKey] = { revenue: 0, expenses: 0, profit: 0 };
        if (type === "income") monthlyTotals[monthKey].revenue += amount;
        else if (type === "expense") monthlyTotals[monthKey].expenses += amount;
        monthlyTotals[monthKey].profit =
          monthlyTotals[monthKey].revenue - monthlyTotals[monthKey].expenses;
      };

      filteredExpenditures.forEach((item) => {
        const transactionDate = getTransactionDate(item);
        if (!transactionDate) return;
        let category = item.category || `مصارف عمومی`;
        if (item.floor && !item.category) category = `مصارف منزل ${item.floor}`;
        const description = item.description || `مصارف: ${category}`;
        addTransaction(
          item,
          "expense",
          item.amount,
          transactionDate,
          description,
          category,
          ENDPOINTS.EXPENDITURES,
          item.receiver
        );
      });

      filteredExpenditureIncome.forEach((item) => {
        const transactionDate = getTransactionDate(item);
        if (!transactionDate) return;
        const description =
          item.description || item.source || `درآمد متفرقه #${item.id}`;
        const category = item.source || "درآمد متفرقه";
        addTransaction(
          item,
          "income",
          item.amount,
          transactionDate,
          description,
          category,
          ENDPOINTS.EXPENDITURE_INCOME,
          item.receiver
        );
      });

      filteredRent.forEach((rentRecord) => {
        const transactionDate = getTransactionDate(rentRecord);
        if (!transactionDate) return;
        const customerListKey = "customers_list";
        if (
          rentRecord[customerListKey] &&
          typeof rentRecord[customerListKey] === "object"
        ) {
          Object.entries(rentRecord[customerListKey]).forEach(
            ([customerId, details]) => {
              if (details && typeof details === "object" && details.taken) {
                const description = `کرایه - منزل: ${
                  rentRecord.floor ?? "N/A"
                } - ${localCustomers[customerId] || `مشتری ${customerId}`}`;
                addTransaction(
                  rentRecord,
                  "income",
                  details.taken,
                  transactionDate,
                  description,
                  "کرایه",
                  ENDPOINTS.RENT,
                  customerId,
                  "customer"
                );
              }
            }
          );
        } else if (rentRecord.total_taken) {
          const description = `کرایه کلی - منزل: ${
            rentRecord.floor ?? "N/A"
          } - ریکارد ID ${rentRecord.id}`;
          addTransaction(
            rentRecord,
            "income",
            rentRecord.total_taken,
            transactionDate,
            description,
            "کرایه",
            ENDPOINTS.RENT,
            `ریکارد ${rentRecord.id}`
          );
        }
      });

      filteredService.forEach((serviceRecord) => {
        const transactionDate = getTransactionDate(serviceRecord);
        if (!transactionDate) return;
        const customerListKey = "customers_list";
        if (
          serviceRecord[customerListKey] &&
          typeof serviceRecord[customerListKey] === "object"
        ) {
          Object.entries(serviceRecord[customerListKey]).forEach(
            ([customerId, details]) => {
              if (details && typeof details === "object" && details.taken) {
                const description = `فیس خدمات - منزل: ${
                  serviceRecord.floor ?? "N/A"
                } - ${localCustomers[customerId] || `مشتری ${customerId}`}`;
                addTransaction(
                  serviceRecord,
                  "income",
                  details.taken,
                  transactionDate,
                  description,
                  "فیس خدمات",
                  ENDPOINTS.SERVICES,
                  customerId,
                  "customer"
                );
              }
            }
          );
        } else if (serviceRecord.total_taken) {
          const description = `فیس خدمات کلی - منزل: ${
            serviceRecord.floor ?? "N/A"
          } - ریکارد ID ${serviceRecord.id}`;
          addTransaction(
            serviceRecord,
            "income",
            serviceRecord.total_taken,
            transactionDate,
            description,
            "فیس خدمات",
            ENDPOINTS.SERVICES,
            `ریکارد ${serviceRecord.id}`
          );
        }
      });

      filteredUnitBills.forEach((billRecord) => {
        const transactionDate = getTransactionDate(billRecord);
        if (!transactionDate) {
          console.warn(
            "Skipping unit bill record due to missing/invalid date:",
            billRecord.id
          );
          return;
        }
        if (
          billRecord.unit_details_list &&
          typeof billRecord.unit_details_list === "object"
        ) {
          Object.entries(billRecord.unit_details_list).forEach(
            ([_detailKey, unitDetail]) => {
              if (
                unitDetail &&
                typeof unitDetail === "object" &&
                unitDetail.taken
              ) {
                const amountTaken = parseFloat(
                  String(unitDetail.taken).replace(/,/g, "") || 0
                );
                if (amountTaken > 0) {
                  const customerName =
                    unitDetail.customer_name || "مشتری نامعلوم";
                  const unitNumber = unitDetail.unit_number || "واحد نامعلوم";
                  const description = `بیل واحد: ${customerName} (واحد ${unitNumber}), دوره ${billRecord.month}/${billRecord.year}`;
                  addTransaction(
                    billRecord,
                    "income",
                    amountTaken,
                    transactionDate,
                    description,
                    "بیل واحدها",
                    ENDPOINTS.UNIT_BILLS,
                    unitDetail.unit_id,
                    null
                  );
                }
              }
            }
          );
        }
      });

      // Process Unit Finances (as Expenses/Discounts)
      filteredUnitFinances.forEach((item) => {
        const transactionDate = getTransactionDate(item); // Uses item.issue_date
        if (!transactionDate) {
          console.warn(
            "Skipping unit finance record due to missing/invalid date:",
            item.id,
            item
          );
          return;
        }
        const description = `تخفیف واحد - از: ${
          item.form_person || "نامشخص"
        } به: ${item.to_person || "نامشخص"} (${
          item.description || "بدون شرح"
        })`;
        addTransaction(
          item, // The finance record item
          "expense", // This will reduce net profit
          item.amount,
          transactionDate,
          description,
          "تخفیف واحدها", // New category
          ENDPOINTS.UNIT_FINANCES,
          item.id, // relatedId (ID of the finance record)
          null // relatedEntity (generic, so relatedName will be "ID: <item.id>")
        );
      });

      filteredSalary.forEach((salaryRecord) => {
        const transactionDate = getTransactionDate(salaryRecord);
        if (!transactionDate) {
          console.warn(
            "Skipping salary record due to missing/invalid date:",
            salaryRecord
          );
          return;
        }
        const amountPaid = salaryRecord.total_taken;
        const amount = parseFloat(String(amountPaid).replace(/,/g, "") || 0);
        if (!isNaN(amount) && amount > 0) {
          const staffId =
            salaryRecord.staff?.id ||
            salaryRecord.staff_id ||
            salaryRecord.staff;
          let staffName = "کارمندان";
          if (
            typeof salaryRecord.staff === "object" &&
            salaryRecord.staff?.name
          )
            staffName = salaryRecord.staff.name;
          else if (typeof salaryRecord.staff === "string" && salaryRecord.staff)
            staffName = salaryRecord.staff;
          else if (
            salaryRecord.customers_list &&
            staffId &&
            salaryRecord.customers_list[staffId]?.name
          )
            staffName = salaryRecord.customers_list[staffId].name;
          else if (salaryRecord.customers_list) {
            const staffDetails = Object.values(salaryRecord.customers_list);
            if (staffDetails.length === 1 && staffDetails[0].name)
              staffName = staffDetails[0].name;
            else if (staffDetails.length > 1)
              staffName = `کارمندان (${staffDetails.length} نفر)`;
          } else if (staffId) staffName = `کارمند ${staffId}`;
          const description = `پرداخت معاش - ${staffName} (ریکارد ماه ${salaryRecord.month}/${salaryRecord.year})`;
          const relatedIdToPass = staffId || `ریکارد ${salaryRecord.id}`;
          addTransaction(
            salaryRecord,
            "expense",
            amount,
            transactionDate,
            description,
            "معاش",
            ENDPOINTS.SALARIES,
            relatedIdToPass,
            "staff"
          );
        }
      });

      let calculatedTotalReminder = 0;
      filteredRent.forEach((item) => {
        const recordReminder = parseFloat(
          String(item?.total_remainder).replace(/,/g, "") || 0
        );
        if (!isNaN(recordReminder) && recordReminder > 0)
          calculatedTotalReminder += recordReminder;
        else if (
          item.customers_list &&
          typeof item.customers_list === "object"
        ) {
          Object.values(item.customers_list).forEach((details) => {
            const customerRemainder = parseFloat(
              String(details?.remainder).replace(/,/g, "") || 0
            );
            if (!isNaN(customerRemainder) && customerRemainder > 0)
              calculatedTotalReminder += customerRemainder;
          });
        }
      });
      filteredService.forEach((item) => {
        const recordReminder = parseFloat(
          String(item?.total_remainder).replace(/,/g, "") || 0
        );
        if (!isNaN(recordReminder) && recordReminder > 0)
          calculatedTotalReminder += recordReminder;
        else if (
          item.customers_list &&
          typeof item.customers_list === "object"
        ) {
          Object.values(item.customers_list).forEach((details) => {
            const customerRemainder = parseFloat(
              String(details?.remainder).replace(/,/g, "") || 0
            );
            if (!isNaN(customerRemainder) && customerRemainder > 0)
              calculatedTotalReminder += customerRemainder;
          });
        }
      });
      setTotalReminder(calculatedTotalReminder);

      let calculatedTotalSalaryReminder = 0;
      filteredSalary.forEach((item) => {
        const recordRemainder = parseFloat(
          String(item?.total_remainder).replace(/,/g, "") || 0
        );
        if (!isNaN(recordRemainder) && recordRemainder > 0)
          calculatedTotalSalaryReminder += recordRemainder;
        else {
          const totalAmount = parseFloat(
            String(item?.total_amount).replace(/,/g, "") || 0
          );
          const totalTaken = parseFloat(
            String(item?.total_taken).replace(/,/g, "") || 0
          );
          if (!isNaN(totalAmount) && totalAmount > 0 && !isNaN(totalTaken)) {
            const calculatedRemainder = totalAmount - totalTaken;
            if (calculatedRemainder > 0)
              calculatedTotalSalaryReminder += calculatedRemainder;
          }
        }
      });
      setTotalSalaryReminder(calculatedTotalSalaryReminder);

      let calculatedTotalUnitBillsReminder = 0;
      filteredUnitBills.forEach((billRecord) => {
        const billTotalRemainder = parseFloat(
          String(billRecord?.total_remainder).replace(/,/g, "") || 0
        );
        if (!isNaN(billTotalRemainder) && billTotalRemainder > 0)
          calculatedTotalUnitBillsReminder += billTotalRemainder;
      });
      setTotalUnitBillsReminder(calculatedTotalUnitBillsReminder);

      const totalRevenue = combined
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = combined
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      setSummaryData({
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
      });

      const chartDataFormatted = Object.entries(monthlyTotals)
        .map(([period, data]) => {
          const [year, month] = period.split("-");
          try {
            const { jy, jm } = gregorianToJalaali(
              parseInt(year),
              parseInt(month),
              15
            );
            const label = `${getPersianMonthNameJalaali(jm)} ${jy}`;
            return {
              monthLabel: label,
              period,
              revenue: data.revenue || 0,
              expenses: data.expenses || 0,
              profit: data.profit || 0,
            };
          } catch (e) {
            console.error(
              `Error converting Gregorian period ${period} to Jalaali:`,
              e
            );
            return {
              monthLabel: period,
              period,
              revenue: data.revenue || 0,
              expenses: data.expenses || 0,
              profit: data.profit || 0,
            };
          }
        })
        .sort((a, b) => a.period.localeCompare(b.period));
      setChartData(chartDataFormatted);

      combined.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setAllTransactions(combined);

      const incomeSources = combined
        .filter((t) => t.type === "income")
        .reduce((acc, transaction) => {
          const sourceName = transaction.category || "سایر درآمدها";
          acc[sourceName] = (acc[sourceName] || 0) + transaction.amount;
          return acc;
        }, {});
      const formattedIncomeDistribution = Object.entries(incomeSources)
        .map(([name, value]) => ({ name, value }))
        .filter((item) => item.value > 0)
        .sort((a, b) => b.value - a.value);
      setIncomeSourceDistributionData(formattedIncomeDistribution);
    } catch (err) {
      console.error("!!! Error during MAIN data processing steps:", err);
      const displayError = err.message?.includes("Network Error")
        ? "خطای شبکه: اتصال به سرور برقرار نشد."
        : `خطا در پردازش اطلاعات: ${err.message || "یک خطای ناشناخته رخ داد."}`;
      setError((prev) => (prev ? `${prev}\n${displayError}` : displayError));
      setSummaryData({ totalRevenue: 0, totalExpenses: 0, netProfit: 0 });
      setChartData([]);
      setAllTransactions([]);
      setTableData([]);
      setExtraSummary({
        totalCustomers: 0,
        activeAgreements: 0,
        activeShops: 0,
      });
      setIncomeSourceDistributionData([]);
      setTotalReminder(0);
      setTotalSalaryReminder(0);
      setTotalUnitBillsReminder(0);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (!allTransactions || allTransactions.length === 0) {
      setTableData([]);
      setTotalItems(0);
      setTotalPages(1);
      setCurrentPage(1);
      return;
    }
    const filtered = allTransactions.filter((item) => {
      if (!item) return false;
      const searchTermLower = searchTerm.toLowerCase();
      const typeMatch =
        !transactionTypeFilter || item.type === transactionTypeFilter;
      const searchMatch =
        !searchTerm ||
        item.description?.toLowerCase().includes(searchTermLower) ||
        item.relatedName?.toLowerCase().includes(searchTermLower) ||
        item.category?.toLowerCase().includes(searchTermLower);
      const categoryMatch = !categoryFilter || item.category === categoryFilter;
      return typeMatch && searchMatch && categoryMatch;
    });
    const totalFilteredItems = filtered.length;
    const calculatedTotalPages = Math.ceil(totalFilteredItems / ITEMS_PER_PAGE);
    const newTotalPages = calculatedTotalPages > 0 ? calculatedTotalPages : 1;
    const newCurrentPage = Math.max(1, Math.min(currentPage, newTotalPages));
    const startIndex = (newCurrentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setTableData(filtered.slice(startIndex, endIndex));
    setTotalItems(totalFilteredItems);
    setTotalPages(newTotalPages);
    if (newCurrentPage !== currentPage) setCurrentPage(newCurrentPage);
  }, [
    allTransactions,
    currentPage,
    searchTerm,
    categoryFilter,
    transactionTypeFilter,
  ]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchReportData();
  };
  const handleLocalFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };
  const handleSearchChange = (e) =>
    handleLocalFilterChange(setSearchTerm, e.target.value);
  const handleCategoryChange = (e) =>
    handleLocalFilterChange(setCategoryFilter, e.target.value);
  const handleTransactionTypeChange = (e) =>
    handleLocalFilterChange(setTransactionTypeFilter, e.target.value);
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage)
      setCurrentPage(newPage);
  };
  const handleDownload = () => {
    console.log("Download triggered for (filtered):", tableData);
    alert("عملکرد دانلود نیاز به پیاده‌سازی دارد.");
  };
  const handlePrint = () => window.print();

  const uniqueCategories = useMemo(() => {
    const categories = new Set(
      allTransactions.map((t) => t.category).filter(Boolean)
    );
    return Array.from(categories).sort((a, b) => a.localeCompare(b, "fa"));
  }, [allTransactions]);

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h2 className="text-xl lg:text-2xl font-semibold text-gray-800 self-start sm:self-center">
          گزارشات مالی
        </h2>
        <div className="flex space-x-2 sm:space-x-3 space-x-reverse self-end sm:self-center">
          <button
            onClick={handleDownload}
            disabled={isLoading || tableData.length === 0}
            className="flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
          >
            <FiDownload className="ml-1 sm:ml-2" /> خروجی
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
          >
            <FiPrinter className="ml-1 sm:ml-2" /> چاپ
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label
              htmlFor="fr_startDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              از تاریخ
            </label>
            <DatePicker
              id="fr_startDate"
              selected={startDate}
              onChange={(date) => date && setStartDate(date)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              dateFormat="yyyy/MM/dd"
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={endDate}
              placeholderText="انتخاب تاریخ شروع"
              popperPlacement="bottom-start"
            />
          </div>
          <div>
            <label
              htmlFor="fr_endDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              تا تاریخ
            </label>
            <DatePicker
              id="fr_endDate"
              selected={endDate}
              onChange={(date) => date && setEndDate(date)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              dateFormat="yyyy/MM/dd"
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="انتخاب تاریخ پایان"
              popperPlacement="bottom-start"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleApplyFilters}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 text-sm font-medium"
            >
              {isLoading ? (
                <FaSpinner className="animate-spin ml-2" />
              ) : (
                <FiFilter className="ml-2" />
              )}
              اعمال محدوده تاریخ
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500 transition-shadow hover:shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl text-gray-500 mb-1 uppercase font-medium">
                مجموع عواید
              </p>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-800">
                {isLoading && !summaryData.totalRevenue ? (
                  <FaSpinner className="animate-spin text-blue-500" />
                ) : (
                  formatCurrency(summaryData.totalRevenue)
                )}
              </h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FiTrendingUp className="text-blue-500 text-lg" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-red-500 transition-shadow hover:shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl text-gray-500 mb-1 uppercase font-medium">
                مجموع مصارف
              </p>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-800">
                {isLoading && !summaryData.totalExpenses && !error ? (
                  <FaSpinner className="animate-spin text-red-500" />
                ) : (
                  formatCurrency(summaryData.totalExpenses)
                )}
              </h3>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <FiTrendingDown className="text-red-500 text-lg" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500 transition-shadow hover:shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl text-gray-500 mb-1 uppercase font-medium">
                سود / زیان خالص
              </p>
              <h3
                className={`text-xl lg:text-2xl font-bold ${
                  summaryData.netProfit >= 0
                    ? "text-green-700"
                    : "text-yellow-600"
                }`}
              >
                {isLoading &&
                !(summaryData.totalRevenue || summaryData.totalExpenses) &&
                !error ? (
                  <FaSpinner className="animate-spin text-green-500" />
                ) : (
                  formatCurrency(summaryData.netProfit)
                )}
              </h3>
            </div>
            <div
              className={`${
                summaryData.netProfit >= 0 ? "bg-green-100" : "bg-yellow-100"
              } p-3 rounded-full`}
            >
              <FiDollarSign
                className={`${
                  summaryData.netProfit >= 0
                    ? "text-green-500"
                    : "text-yellow-500"
                } text-lg`}
              />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-yellow-500 transition-shadow hover:shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl text-gray-500 mb-1 uppercase font-medium">
                مجموع باقیات (کرایه/خدمات)
              </p>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-800">
                {isLoading && totalReminder === 0 && !error ? (
                  <FaSpinner className="animate-spin text-yellow-500" />
                ) : (
                  formatCurrency(totalReminder)
                )}
              </h3>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <FiBell className="text-yellow-500 text-lg" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-cyan-500 transition-shadow hover:shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl text-gray-500 mb-1 uppercase font-medium">
                باقیات احدها
              </p>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-800">
                {isLoading && totalUnitBillsReminder === 0 && !error ? (
                  <FaSpinner className="animate-spin text-cyan-500" />
                ) : (
                  formatCurrency(totalUnitBillsReminder)
                )}
              </h3>
            </div>
            <div className="bg-cyan-100 p-3 rounded-full">
              <FiFileText className="text-cyan-500 text-lg" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-rose-500 transition-shadow hover:shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl text-gray-500 mb-1 uppercase font-medium">
                مجموع معاشات باقی مانده
              </p>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-800">
                {isLoading && totalSalaryReminder === 0 && !error ? (
                  <FaSpinner className="animate-spin text-rose-500" />
                ) : (
                  formatCurrency(totalSalaryReminder)
                )}
              </h3>
            </div>
            <div className="bg-rose-100 p-3 rounded-full">
              <FiUserMinus className="text-rose-500 text-lg" />
            </div>
          </div>
        </div>
        {/* <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-orange-500 transition-shadow hover:shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl text-gray-500 mb-1 uppercase font-medium">
                دکان های فعال
              </p>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-800">
                {isLoading && !extraSummary.activeShops ? (
                  <FaSpinner className="animate-spin text-orange-500" />
                ) : (
                  extraSummary.activeShops
                )}
              </h3>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <FiHome className="text-orange-500 text-lg" />
            </div>
          </div>
        </div> */}
        {/* <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-purple-500 transition-shadow hover:shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl text-gray-500 mb-1 uppercase font-medium">
                مجموع مشتریان
              </p>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-800">
                {isLoading && !extraSummary.totalCustomers ? (
                  <FaSpinner className="animate-spin text-purple-500" />
                ) : (
                  extraSummary.totalCustomers
                )}
              </h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FiUsers className="text-purple-500 text-lg" />
            </div>
          </div>
        </div> */}
        {/* <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-teal-500 transition-shadow hover:shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl text-gray-500 mb-1 uppercase font-medium">
                قراردادهای فعال
              </p>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-800">
                {isLoading && !extraSummary.activeAgreements ? (
                  <FaSpinner className="animate-spin text-teal-500" />
                ) : (
                  extraSummary.activeAgreements
                )}
              </h3>
            </div>
            <div className="bg-teal-100 p-3 rounded-full">
              <FiClipboard className="text-teal-500 text-lg" />
            </div>
          </div>
        </div> */}
      </div>

      {/* Bar and Pie Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            عواید ماهانه در مقابل مصارف
          </h3>
          <div className="h-80 relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-20 rounded-lg">
                <FaSpinner className="animate-spin text-blue-600 text-3xl" />
              </div>
            )}
            {!isLoading && chartData.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 z-10 p-4 text-center text-sm">
                {error ? "خطا در بارگذاری گراف." : "داده ای یافت نشد."}
              </div>
            )}
            {!isLoading && chartData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: -15, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="monthLabel"
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                    angle={-30}
                    textAnchor="end"
                    height={40}
                    interval={0}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) =>
                      formatCurrency(v, "AFN").replace(/AFN|\s/g, "")
                    }
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                    width={45}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: "12px",
                      borderRadius: "8px",
                      padding: "8px",
                      direction: "rtl",
                      borderColor: "#e5e7eb",
                    }}
                    formatter={(v, n) => [
                      formatCurrency(v),
                      n === "revenue" ? "عواید" : "مصارف",
                    ]}
                    labelFormatter={(l) => `ماه: ${l}`}
                    cursor={{ fill: "rgba(209, 213, 219, 0.3)" }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: "11px",
                      paddingTop: "15px",
                      textAlign: "center",
                    }}
                    verticalAlign="top"
                    align="center"
                  />
                  <Bar
                    dataKey="revenue"
                    name="عواید"
                    fill="#4f46e5"
                    radius={[4, 4, 0, 0]}
                    barSize={15}
                  />
                  <Bar
                    dataKey="expenses"
                    name="مصارف"
                    fill="#f43f5e"
                    radius={[4, 4, 0, 0]}
                    barSize={15}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            توزیع منابع درآمد
          </h3>
          <div className="h-80 relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-20 rounded-lg">
                <FaSpinner className="animate-spin text-purple-600 text-3xl" />
              </div>
            )}
            {!isLoading && incomeSourceDistributionData.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 z-10 p-4 text-center text-sm">
                {error && summaryData.totalRevenue === 0
                  ? "خطا در بارگذاری."
                  : "درآمدی یافت نشد."}
              </div>
            )}
            {!isLoading && incomeSourceDistributionData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeSourceDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius="80%"
                    innerRadius="40%"
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    paddingAngle={2}
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      percent,
                    }) => {
                      if (percent * 100 < 3) return null;
                      const RADIAN = Math.PI / 180;
                      const radius =
                        innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#fff"
                          textAnchor={x > cx ? "start" : "end"}
                          dominantBaseline="central"
                          fontSize={9}
                          fontWeight="bold"
                        >{`${(percent * 100).toFixed(0)}%`}</text>
                      );
                    }}
                  >
                    {incomeSourceDistributionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]}
                        stroke="#fff"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [formatCurrency(v), n]} />
                  <Legend
                    wrapperStyle={{
                      fontSize: "11px",
                      lineHeight: "1.5",
                      maxHeight: "100px",
                      overflowY: "auto",
                    }}
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Area Chart: Monthly Overview */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <h3 className="text-xl sm:text-xl font-semibold text-gray-800">
            نمای کلی مالی ماهانه (گراف)
          </h3>
          <select
            id="fr_chartReportType"
            className="p-1.5 border border-gray-300 rounded-lg bg-white text-xs focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="all">همه موارد</option>{" "}
            <option value="revenue">عواید</option>{" "}
            <option value="expenses">مصارف</option>{" "}
            <option value="profit">سود</option>
          </select>
        </div>
        <div className="h-80 sm:h-96 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-20 rounded-lg">
              <FaSpinner className="animate-spin text-blue-600 text-4xl" />
            </div>
          )}
          {!isLoading && chartData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 z-10 p-4 text-center text-sm">
              {error ? "خطا در بارگذاری گراف." : "داده ای یافت نشد."}
            </div>
          )}
          {!isLoading && chartData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 5, left: 15, bottom: 45 }}
              >
                <defs>
                  <linearGradient
                    id="fr_colorRevenue"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="fr_colorExpenses"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="fr_colorProfit"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="monthLabel"
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval="preserveStartEnd"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) =>
                    formatCurrency(v, "AFN").replace(/AFN|\s/g, "")
                  }
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  width={55}
                  axisLine={false}
                  tickLine={false}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: "12px",
                    borderRadius: "8px",
                    padding: "8px",
                    direction: "rtl",
                    borderColor: "#e5e7eb",
                  }}
                  formatter={(v, n) => [`${formatCurrency(v)}`, n]}
                  labelFormatter={(l) => `ماه: ${l}`}
                  cursor={{
                    stroke: "#9ca3af",
                    strokeWidth: 1,
                    strokeDasharray: "3 3",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "15px" }}
                  verticalAlign="top"
                  align="center"
                />
                {(reportType === "revenue" || reportType === "all") && (
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="عواید"
                    stroke="#4f46e5"
                    fillOpacity={1}
                    fill="url(#fr_colorRevenue)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 5,
                      strokeWidth: 1,
                      fill: "#fff",
                      stroke: "#4f46e5",
                    }}
                  />
                )}
                {(reportType === "expenses" || reportType === "all") && (
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="مصارف"
                    stroke="#ec4899"
                    fillOpacity={1}
                    fill="url(#fr_colorExpenses)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 5,
                      strokeWidth: 1,
                      fill: "#fff",
                      stroke: "#ec4899",
                    }}
                  />
                )}
                {(reportType === "profit" || reportType === "all") && (
                  <Area
                    type="monotone"
                    dataKey="profit"
                    name="سود"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#fr_colorProfit)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 5,
                      strokeWidth: 1,
                      fill: "#fff",
                      stroke: "#10b981",
                    }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Detailed Transactions Table Section */}
      <div
        id="fr_transaction-table"
        className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200"
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3 md:gap-4 flex-wrap">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 whitespace-nowrap mr-4 order-1 md:order-1">
            جزئیات تراکنش ها ({totalItems})
          </h3>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 sm:space-x-reverse w-full md:w-auto items-stretch sm:items-center order-3 md:order-2">
            <select
              className="p-2 border border-gray-300 rounded-lg text-xs sm:text-sm bg-white focus:ring-blue-500 focus:border-blue-500 shadow-sm appearance-none"
              value={transactionTypeFilter}
              onChange={handleTransactionTypeChange}
            >
              <option value="">همه انواع</option>{" "}
              <option value="income">درآمد</option>{" "}
              <option value="expense">هزینه</option>
            </select>
            <select
              className="p-2 border border-gray-300 rounded-lg text-xs sm:text-sm bg-white focus:ring-blue-500 focus:border-blue-500 shadow-sm appearance-none"
              value={categoryFilter}
              onChange={handleCategoryChange}
              disabled={uniqueCategories.length === 0 || isLoading}
            >
              <option value="">همه دسته بندی ها</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="جستجو..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="p-2 border border-gray-300 rounded-lg text-xs sm:text-sm w-full pr-8 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto relative min-h-[250px]">
          {isLoading && tableData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 z-10 rounded-lg">
              <FaSpinner className="animate-spin text-blue-600 text-3xl" />
            </div>
          )}
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="sticky top-0 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10"
                >
                  تاریخ
                </th>
                <th
                  scope="col"
                  className="sticky top-0 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10 min-w-[150px]"
                >
                  شرح
                </th>
                <th
                  scope="col"
                  className="sticky top-0 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10"
                >
                  دسته بندی
                </th>
                <th
                  scope="col"
                  className="sticky top-0 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10"
                >
                  مقدار
                </th>
                <th
                  scope="col"
                  className="sticky top-0 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10"
                >
                  نوع
                </th>
                <th
                  scope="col"
                  className="sticky top-0 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10"
                >
                  مربوط به
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!isLoading && tableData.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    {allTransactions.length > 0
                      ? "تراکنشی مطابق با فیلترها یافت نشد."
                      : error
                      ? "خطا در بارگذاری جدول."
                      : "تراکنشی یافت نشد."}
                  </td>
                </tr>
              )}
              {tableData.map((item) => (
                <tr
                  key={item.key}
                  className="hover:bg-gray-50 align-top transition-colors duration-150"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700 tabular-nums">
                    {getPersianDate(item.date)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-800 max-w-xs break-words">
                    {item.description}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                    {item.category}
                  </td>
                  <td
                    className={`px-4 py-3 whitespace-nowrap text-xs font-medium tabular-nums ${
                      item.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {item.type === "income" ? "+" : "-"}{" "}
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 inline-flex text-[11px] leading-4 font-semibold rounded-full ${
                        item.type === "income"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.type === "income" ? "درآمد" : "هزینه"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                    {item.relatedName || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && totalItems > ITEMS_PER_PAGE && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-2 gap-3 border-t border-gray-200 pt-4">
            <div className="text-xs sm:text-sm text-gray-600">
              نمایش {(currentPage - 1) * ITEMS_PER_PAGE + 1} تا{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} از{" "}
              {totalItems} مورد
            </div>
            <div className="flex items-center space-x-1 space-x-reverse">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                قبلی
              </button>
              <span className="px-3 py-1 border border-gray-300 rounded-md text-xs sm:text-sm bg-gray-100 font-medium">
                صفحه {currentPage} از {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                بعدی
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialReports;
