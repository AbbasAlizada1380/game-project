// Sidebar.js (Corrected Role Handling)

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { signOutSuccess } from "../../state/userSlice/userSlice"; // Make sure path is correct
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { FaSignOutAlt, FaUserPlus } from "react-icons/fa";
import { FaMoneyBillWave } from "react-icons/fa";
import { MdSportsKabaddi } from "react-icons/md"; // Sports/Athletes
import { RiUserStarFill } from "react-icons/ri"; // Active athletes / highlighted users
import { MdOutlineDashboard } from "react-icons/md"; // Home/Dashboard

const Sidebar = ({ setActiveComponent }) => {
  const [selectedC, setSelectedC] = useState("home");
  const [activeC, setActiveC] = useState("home");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const MySwal = withReactContent(Swal);

  const handleSignOut = () => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, sign out!",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(signOutSuccess());
        navigate("/sign-in");
      }
    });
  };

  const AllComponents = [
    {
      name: "صفحه اصلی", // Home Page
      value: "home",
      icon: <MdOutlineDashboard />, // Dashboard icon
    },
    {
      name: "ورزشکاران", // Athletes
      value: "Athletes",
      icon: <MdSportsKabaddi />, // Sports icon
    },
    {
      name: "فیس", // Fees
      value: "Fees",
      icon: <FaMoneyBillWave />, // Money / Payment icon
    },
    {
      name: "ورزشکاران فعال", // Active Athletes
      value: "ActiveAthletes",
      icon: <RiUserStarFill />, // Starred user = active athletes
    },
    {
      name: "ثبت کاربر جدید", // Create New User
      value: "CreateUsers",
      icon: <FaUserPlus />, // User Plus icon
    },
    {
      name: "خروج", // Sign Out
      value: "signout",
      icon: <FaSignOutAlt />, // Sign out icon
    },
  ];

  let accessibleComponents = [];
  if (
    currentUser &&
    currentUser.role &&
    Array.isArray(currentUser.role) &&
    currentUser.role.length > 0
  ) {
    const userRoleNumber = currentUser.role[0];

    if (userRoleNumber === 0 || userRoleNumber === 1) {
      accessibleComponents = AllComponents;
    } else if (userRoleNumber === 3) {
      const role2AllowedValues = [
        "home",
        "ServiceManager",
        "RentManger",
        "Salaries",
        "Expenses",
        "Incomes",
        "BlockesServices",
        "financial",
        "signout",
      ];
      accessibleComponents = AllComponents.filter((component) =>
        role2AllowedValues.includes(component.value)
      );
    } else {
      accessibleComponents = AllComponents.filter(
        (component) => component.value === "signout"
      );
    }
  } else {
    accessibleComponents = AllComponents.filter(
      (component) => component.value === "signout"
    );
  }

  return (
    <div className="h-full w-64 bg-white overflow-y-auto shadow-xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <header className="flex items-center p-5 mb-2">
          <div className="p-1 ">
            <img src="/logo.png" alt="Logo" className="h-9 w-9" />
          </div>
          <span className="mr-3 text-xl font-bold text-gray-800">
            کلپ بوگسینگ ملت
          </span>
        </header>

        {/* Menu Items */}
        <ul className="space-y-1 px-2">
          {AllComponents.map((component, index) => (
            <li key={index} className="relative">
              {component.value === "signout" ? (
                <button
                  onClick={handleSignOut}
                  className={`w-full flex items-center gap-x-3 px-4 py-3 rounded-lg transition-all duration-200
              hover:bg-gradient-to-l from-blue-500  to-purple-500 cursor-pointer hover:text-white hover:shadow-md
              ${
                activeC === component.value
                  ? "bg-white text-indigo-700 font-medium"
                  : "text-gray-700"
              }`}
                >
                  <span className="text-xl mr-3 font-semibold">
                    {component.icon}
                  </span>
                  <span className="text-sm font-semibold">
                    {component.name}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setActiveComponent(component.value);
                    setSelectedC(component.value);
                    setActiveC(component.value);
                  }}
                  className={`w-full flex items-center cursor-pointer gap-x-3 px-4 py-3 rounded-lg transition-all duration-200
              ${
                activeC === component.value
                  ? "bg-gradient-to-l from-blue-500  to-purple-500 cursor-pointer text-white font-medium shadow-md"
                  : "hover:bg-gradient-to-l from-blue-500  to-purple-500 text-gray-700 cursor-pointer hover:text-white"
              }`}
                >
                  <span className="text-xl font-semibold mr-3">
                    {component.icon}
                  </span>
                  <span className="text-base font-semibold ">
                    {component.name}
                  </span>
                  {activeC === component.value && (
                    <span className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></span>
                  )}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* User Profile at Bottom */}
      {currentUser && (
        <div className="p-4  border-t border-gray-300 flex items-center gap-3">
          <img
            src={
              currentUser.profileImage ||
              "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200"
            }
            alt="User"
            className="h-10 w-10 rounded-full object-cover border"
          />
          <div>
            <p className="font-semibold text-gray-800 text-sm">
              {currentUser.name || "استاد رحیم"}
            </p>
            <p className="text-gray-500 text-xs">
              {currentUser.position || "ترینر"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
