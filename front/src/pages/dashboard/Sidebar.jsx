// Sidebar.js (Corrected Role Handling)

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { signOutSuccess } from "../../state/userSlice/userSlice"; // Make sure path is correct
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import {
  FaSignOutAlt,
  FaMoneyBill,
  FaBuilding,
  FaUserPlus,
  FaUsers,
} from "react-icons/fa";
import { LuActivity, LuUserRoundPlus } from "react-icons/lu";
import { FaShop } from "react-icons/fa6";

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
      icon: <LuActivity />, // Activity / Dashboard
    },
    {
      name: "ورزشکاران", // Athletes
      value: "Athletes",
      icon: <LuUserRoundPlus />, // User with Plus Icon
    },
    {
      name: "فیس", // Fees
      value: "Fees",
      icon: <FaMoneyBill />, // Money Icon
    },
    {
      name: "ورزشکاران فعال", // Active Athletes
      value: "ActiveAthletes",
      icon: <FaBuilding />, // Building Icon (e.g., gym or facility)
    },
    {
      name: " ثبت کاربر جدید", // Create New User
      value: "CreateUsers",
      icon: <FaUserPlus />, // User Plus Icon (FaUserPlus from react-icons/fa)
    },
    {
      name: "خروج", // Sign Out
      value: "signout",
      icon: <FaSignOutAlt />, // Sign Out Icon
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
    <div className="h-full w-64 bg-zinc-800 overflow-y-auto shadow-xl">
      {/* Header */}
      <header className="flex items-center p-5 mb-2">
        <div className="p-2 bg-white rounded-lg shadow-md">
          <img src="/logo.png" alt="Logo" className="h-8 w-8" />
        </div>
        <span className="mr-3 text-xl font-bold text-white">
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
                className={`w-full flex items-center gap-x-2.5 px-4 py-3 rounded-lg transition-all duration-200
              hover:bg-white cursor-pointer hover:text-zinc-900 hover:shadow-md
              ${
                activeC === component.value
                  ? "bg-white text-indigo-700 font-medium"
                  : "text-indigo-100"
              }`}
              >
                <span className="text-xl mr-3">{component.icon}</span>
                <span className="text-sm">{component.name}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setActiveComponent(component.value);
                  setSelectedC(component.value);
                  setActiveC(component.value);
                }}
                className={`w-full flex items-center cursor-pointer gap-x-2.5 px-4 py-3 rounded-lg transition-all duration-200
              ${
                activeC === component.value
                  ? "bg-white text-zinc-900 font-medium shadow-md"
                  : "text-white hover:bg-white hover:text-zinc-900 hover:shadow-md"
              }`}
              >
                <span className="text-xl mr-3">{component.icon}</span>
                <span className="text-base">{component.name}</span>
                {activeC === component.value && (
                  <span className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded-l-full"></span>
                )}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
