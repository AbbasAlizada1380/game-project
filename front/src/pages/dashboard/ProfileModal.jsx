import React, { useState, useEffect } from "react";
import { FaTimes, FaSpinner } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { updateUser } from "../../state/userSlice/userSlice";

const ProfileModal = ({ isOpen, onClose, currentUser }) => {
  // State management
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // Initialize form data
  useEffect(() => {
    if (currentUser) {
      setFormData({
        first_name: currentUser.first_name || "",
        last_name: currentUser.last_name || "",
        email: currentUser.email || "",
      });
    }
  }, [currentUser, isOpen]);

  // Form input handler
  const handleChange = (e) => {
    if (e.target.id !== "email") {
      setFormData({ ...formData, [e.target.id]: e.target.value });
    }
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for changes
    const changes = Object.entries(formData).reduce((acc, [key, value]) => {
      if (key !== "email" && currentUser[key] !== value) {
        acc[key] = value;
      }
      return acc;
    }, {});

    if (Object.keys(changes).length === 0) {
      toast.info("هیچ تغییری اعمال نشده است", {
        className: "toastify-persian",
        position: "top-left",
        autoClose: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      await dispatch(
        updateUser({
          id: currentUser.id,
          userData: { ...changes, email: currentUser.email },
        })
      ).unwrap();

      toast.success("پروفایل با موفقیت به‌روزرسانی شد", {
        className: "toastify-persian",
        position: "top-left",
        autoClose: 3000,
      });
      setTimeout(onClose, 1500);
    } catch (err) {
      toast.error("خطا در به‌روزرسانی پروفایل", {
        className: "toastify-persian",
        position: "top-left",
        autoClose: 4000,
      });
      console.error("Update error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !currentUser) return null;

  return (
    <div
      className="fixed inset-0 bg-white/10 backdrop-blur-sm z-40 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        dir="rtl"
        className="bg-white/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 w-full max-w-md relative
                 border border-white/20 transition-all duration-300 hover:shadow-3xl
                 font-[IRANSans] text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 left-3 p-2 bg-white/80 backdrop-blur-sm rounded-full
                   text-gray-600 hover:text-gray-900 hover:bg-white/90 shadow-sm
                   transition-all duration-200"
        >
          <FaTimes />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b border-white/30 pb-2">
          ویرایش پروفایل
        </h2>

        <div className="flex justify-center mb-4 relative">
          {currentUser?.profile_picture ? (
            <div className="relative">
              <img
                src={currentUser.profile_picture}
                alt="تصویر پروفایل"
                className="w-24 h-24 rounded-full object-cover border-4 border-white/30
                         shadow-lg hover:border-white/50 transition-all duration-300"
              />
              <div className="absolute inset-0 rounded-full border-2 border-white/20 backdrop-blur-sm" />
            </div>
          ) : (
            <div
              className="w-24 h-24 rounded-full bg-gray-300/80 backdrop-blur-sm flex items-center
                         justify-center text-gray-500 text-4xl border-4 border-white/30 shadow-lg"
            >
              {currentUser?.first_name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700/90 mb-1">
              نام
            </label>
            <input
              type="text"
              id="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200/80 rounded-lg shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50
                       bg-white/70 backdrop-blur-sm transition-all duration-200"
              placeholder="نام خود را وارد کنید"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700/90 mb-1">
              نام خانوادگی
            </label>
            <input
              type="text"
              id="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200/80 rounded-lg shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50
                       bg-white/70 backdrop-blur-sm transition-all duration-200"
              placeholder="نام خانوادگی خود را وارد کنید"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700/90 mb-1">
              ایمیل
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              readOnly
              disabled
              className="w-full px-3 py-2 border border-gray-200/60 rounded-lg shadow-sm
                       bg-gray-100/50 backdrop-blur-sm text-gray-500/90 cursor-not-allowed
                       focus:ring-0 focus:border-gray-200/60"
            />
            <p className="text-xs text-gray-500/80 mt-1">
              امکان تغییر ایمیل وجود ندارد
            </p>
          </div>

          <div className="flex justify-start gap-3 pt-4 border-t border-white/30 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-b from-blue-600 to-blue-700 text-white/95
                       rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md
                       transition-all duration-200 font-medium flex items-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                "ذخیره تغییرات"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-b from-gray-100/80 to-gray-200/80 backdrop-blur-sm
                       text-gray-700/90 rounded-lg hover:from-gray-200/80 hover:to-gray-300/80
                       border border-white/30 shadow-sm transition-all duration-200 font-medium"
              disabled={loading}
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
