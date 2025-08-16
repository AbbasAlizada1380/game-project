import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MainContent from "./MainContent";

const Dashboard = () => {
  const [activeComponent, setActiveComponent] = useState(null);
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="h-screen flex-shrink-0">
        <Sidebar setActiveComponent={setActiveComponent} />
      </div>

      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto  bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50  custom-scrollbar">
          <MainContent activeComponent={activeComponent} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
