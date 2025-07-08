import React from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Input from "./Input";
import useSignin from "../hooks/useSignin";
import { useSelector } from "react-redux";

const LoginPage = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    handleSignin,
    isLoading,
    error,
  } = useSignin();

  const navigate = useNavigate();
  const { currentUser, accessToken } = useSelector((state) => state.user);

  React.useEffect(() => {
    if (currentUser && accessToken) {
      navigate("/dashboard");
    }
  }, [currentUser, accessToken, navigate]);

  return (
    <div
      className="w-full h-screen flex justify-center items-center parallax-bg"
      style={{
        backgroundImage: 'url("/1.jpg")', // Now
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div
        className="absolute inset-0  bg-opacity-60 backdrop-blur-sm"
        style={{ zIndex: 1 }}
      ></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden relative z-10 border border-white/20"
        dir="rtl"
      >
        <div className="p-8">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text"
          >
            خوش آمدید
          </motion.h2>

          <form onSubmit={handleSignin}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Input
                icon={Mail}
                type="email"
                placeholder="ایمیل"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Input
                icon={Lock}
                type="password"
                placeholder="رمز عبور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex items-center mb-6 justify-start"
            >
              <Link
                to="/forgot-password"
                className="text-sm text-cyan-400 hover:underline"
              >
                رمز عبور را فراموش کرده‌اید؟
              </Link>
            </motion.div>
{/* 
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-red-500 font-semibold mb-2 text-right"
              >
                {error}
              </motion.p>
            )} */}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white font-bold rounded-lg shadow-lg hover:from-cyan-600 hover:via-blue-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="w-6 h-6 animate-spin mx-auto" />
              ) : (
                "ورود"
              )}
            </motion.button>
          </form>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="px-8 py-4 bg-gray-800/70 flex justify-center"
        >
          <p className="text-sm text-gray-300">
            حساب کاربری ندارید؟{" "}
            <Link to="/sign-up" className="text-cyan-400 hover:underline">
              ثبت نام کنید
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
