import React from "react";
import FinancialReports from "./report/FinancialReports"; // Adjust the import path as needed

const Dashboard = () => {
  return (
    <div className=" p-6 bg-gray-50 min-h-screen text-right" dir="rtl">
      {/* Main Dashboard Title */}
      <h1 className=" text-center text-2xl lg:text-3xl font-bold text-gray-800 mb-6">
         داشبورد کلپ بوگسینگ ملت 
      </h1>

      {/* Render the FinancialReports component */}
      <div className="mt-6">
        <FinancialReports />
      </div>
    </div>
  );
};

export default Dashboard;
