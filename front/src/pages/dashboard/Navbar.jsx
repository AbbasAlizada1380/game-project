import React, { useState, useEffect, useRef } from "react";
import {
  FaBell,
  FaSearch,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { signOutSuccess } from "../../state/userSlice/userSlice"; // Adjust path if needed
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ProfileModal from "./ProfileModal"; // Adjust path if needed
import moment from "moment-jalaali"; // <<<--- IMPORT moment-jalaali
import { shamsiMonths } from "../../utils/dateConvert"; // <<<--- IMPORT your month array (Adjust path)

moment.loadPersian({ usePersianDigits: true, dialect: "persian-modern" });

const Navbar = () => {
  const [dateInfo, setDateInfo] = useState({
    day: "",
    month: "",
    dateNumber: "",
    year: "",
  });
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const updateDate = () => {
      const now = moment();
      const jMonthIndex = now.jMonth();
      const shamsiMonthName = shamsiMonths[jMonthIndex];

      const newDateInfo = {
        day: now.format("dddd"),
        year: now.format("jYYYY"),
        month: shamsiMonthName,
        dateNumber: now.format("jD"),
      };

      setDateInfo(newDateInfo);
    };

    updateDate();
    const timer = setInterval(updateDate, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(signOutSuccess());
    setIsProfileDropdownOpen(false);
    navigate("/sign-in");
  };

  const handleOpenProfileModal = () => {
    setIsProfileModalOpen(true);
    setIsProfileDropdownOpen(false);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  return (
    <>
      <nav className="bg-white text-gray-800 py-2 shadow-sm px-6 grid grid-cols-3 border-b border-gray-200 font-[IRANSans]">
        <div className="flex items-center bg-gray-100 px-4  rounded-xl shadow-sm w-[350px] rtl:flex-row-reverse">
          <FaSearch className="text-gray-500 text-lg ml-2" />
          <input
            type="text"
            placeholder="جستجو..."
            className="bg-transparent  outline-none w-full text-gray-700 placeholder-gray-500 text-sm"
          />
        </div>

        <div className="hidden md:flex items-center justify-center gap-x-4 bg-white">
          <div className="text-center flex  items-center gap-x-2">
            <p className="text-2xl font-bold text-primary">{dateInfo.day}</p>
            <p className="text-lg text-gray-500 font-medium tracking-wide">
              {dateInfo.dateNumber} {dateInfo.month} {dateInfo.year}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-6">
          <div ref={profileDropdownRef} className="relative">
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            >
              {currentUser?.profile_picture ? (
                <img
                  src={currentUser.profile_picture}
                  alt="User Avatar"
                  className="w-9 h-9 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-500 transition-colors"
                />
              ) : (
                <FaUserCircle className="text-3xl text-gray-600 group-hover:text-blue-600 transition-colors" />
              )}
              <span className="text-sm font-medium hidden sm:block text-gray-700">
                {currentUser
                  ? `${currentUser.first_name || ""} ${
                      currentUser.last_name || ""
                    }`
                  : "بارگذاری..."}
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{
                opacity: isProfileDropdownOpen ? 1 : 0,
                y: isProfileDropdownOpen ? 0 : -10,
              }}
              transition={{ duration: 0.2 }}
              className="absolute end-0 z-50 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-gray-100"
              style={{ display: isProfileDropdownOpen ? "block" : "none" }}
            >
              <div className="p-2">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {currentUser?.email}
                  </p>
                </div>
                <button
                  onClick={handleOpenProfileModal}
                  className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <FaUser className="ml-2 text-gray-500" />
                  پروفایل کاربری
                </button>
                <Link
                  to="/dashboard" // Adjust link if needed
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <FaCog className="ml-2 text-gray-500" />
                  تنظیمات
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-2 border-t border-gray-100"
                >
                  <FaSignOutAlt className="ml-2 text-red-500" />
                  خروج از حساب
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </nav>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
        currentUser={currentUser}
      />
    </>
  );
};

export default Navbar;
