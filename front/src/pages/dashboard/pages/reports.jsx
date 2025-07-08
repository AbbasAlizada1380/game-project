import { useState } from "react";

const Report = () => {
  // Initial report data
  const [reports] = useState([
    {
      id: 1,
      date: "2025-02-20",
      type: "Deposit",
      amount: "$500",
      status: "Completed",
    },
    {
      id: 2,
      date: "2025-02-21",
      type: "Withdrawal",
      amount: "$300",
      status: "Pending",
    },
    {
      id: 3,
      date: "2025-02-22",
      type: "Transfer",
      amount: "$1200",
      status: "Completed",
    },
    {
      id: 4,
      date: "2025-02-23",
      type: "Deposit",
      amount: "$750",
      status: "Pending",
    },
    {
      id: 5,
      date: "2025-02-24",
      type: "Withdrawal",
      amount: "$900",
      status: "Completed",
    },
  ]);

  // Summary data
  const [summary] = useState({
    totalReports: reports.length,
    totalRevenue: "$3650",
    pendingReports: reports.filter((r) => r.status === "Pending").length,
  });

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">📑 Reports</h1>
      <p className="text-gray-600 mb-6">
        Generate and analyze financial and operational reports.
      </p>

      {/* Report Summary */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold">Total Reports</h2>
          <p className="text-2xl">{summary.totalReports}</p>
        </div>
        <div className="bg-green-500 text-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold">Total Revenue</h2>
          <p className="text-2xl">{summary.totalRevenue}</p>
        </div>
        <div className="bg-yellow-500 text-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold">Pending Reports</h2>
          <p className="text-2xl">{summary.pendingReports}</p>
        </div>
      </div>

      {/* Report Table */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        📋 Report Details
      </h2>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">ID</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="text-center">
                <td className="border p-2">{report.id}</td>
                <td className="border p-2">{report.date}</td>
                <td className="border p-2">{report.type}</td>
                <td className="border p-2">{report.amount}</td>
                <td
                  className={`border p-2 font-bold ${
                    report.status === "Completed"
                      ? "text-green-500"
                      : "text-yellow-500"
                  }`}
                >
                  {report.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Report;
