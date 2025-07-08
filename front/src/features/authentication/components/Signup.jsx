// frontend/src/pages/Signup.jsx
import { motion } from "framer-motion";
import Input from "../components/Input";
import { Loader, Lock, Mail, User } from "lucide-react";
import { Link } from "react-router-dom";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import useSignup from "../hooks/useSignup";

const SignUpPage = () => {
  const {
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    handleSignup,
    isLoading,
    error,
  } = useSignup();

  return (
    <div
      className="w-full h-screen flex justify-center items-center"
      dir="rtl"
      style={{
        backgroundImage: 'url("/eur.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        style={{ zIndex: 1 }}
      ></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-gray-900 bg-opacity-70 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden relative z-10 border border-gray-700"
      >
        <div className="p-8">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text"
          >
            ایجاد حساب کاربری
          </motion.h2>

          <form onSubmit={handleSignup}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Input
                icon={User}
                type="text"
                placeholder="نام کاربری"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Input
                icon={Mail}
                type="email"
                placeholder="آدرس ایمیل"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Input
                icon={Lock}
                type="password"
                placeholder="رمز عبور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </motion.div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-red-500 font-semibold mt-2"
              >
                {error}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <PasswordStrengthMeter password={password} />
            </motion.div>

            <motion.button
              className="mt-5 w-full py-3 px-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white font-bold rounded-lg shadow-lg hover:from-cyan-600 hover:via-blue-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="animate-spin mx-auto" size={24} />
              ) : (
                "ثبت نام"
              )}
            </motion.button>
          </form>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="px-8 py-4 bg-gray-800 bg-opacity-70 flex justify-center"
        >
          <p className="text-sm text-gray-300">
            حساب دارید؟{" "}
            <Link to={"/sign-in"} className="text-cyan-400 hover:underline">
              ورود
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
