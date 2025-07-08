import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/sign-in");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-50 flex flex-col justify-center items-center p-4"
      dir="rtl"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20"
      >
        <div className="p-8 text-center">
          <div className="relative inline-block mb-6">
            <span className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              ۴
            </span>
            <motion.div
              animate={{
                rotate: [0, 15, -15, 0],
                y: [0, -20, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              }}
              className="absolute top-0 left-0 -ml-6 -mt-4"
            >
              <svg
                className="w-16 h-16 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.div>
            <span className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-500">
              ۰
            </span>
            <span className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
              ۴
            </span>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            اوه اوه! گم شدید؟
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            به نظر می‌رسد صفحه مورد نظر شما به تعطیلات رفته است!
            <span className="inline-block">🏖️</span>
          </p>

          <div className="mb-8">
            <div className="h-2 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 4.5, ease: "linear" }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              در حال انتقال به صفحه ورود در {} ثانیه...
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/sign-in")}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            صبر نکن، همین الان برو!
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        className="mt-8 text-gray-500 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p>اینم یه جوک تا اون موقع:</p>
        <p className="text-gray-700 font-medium">
          چرا توسعه‌دهندگان وب گم نمی‌شوند؟ چون همیشه {}!
        </p>
      </motion.div>
    </div>
  );
}

export default NotFound;
