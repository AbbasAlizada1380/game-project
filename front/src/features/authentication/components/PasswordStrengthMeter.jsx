// frontend/src/components/PasswordStrengthMeter.jsx
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

const PasswordCriteria = ({ password }) => {
  const criteria = [
    { label: "حداقل 6 حرف", met: password.length >= 6 },
    { label: "حاوی حروف بزرگ", met: /[A-Z]/.test(password) },
    { label: "حاوی حروف کوچک", met: /[a-z]/.test(password) },
    { label: "حاوی عدد", met: /\d/.test(password) },
    { label: "حاوی کاراکترهای خاص", met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="mt-2 space-y-1" dir="rtl">
      {criteria.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="flex items-center text-xs"
        >
          {item.met ? (
            <Check className="size-4 text-green-500 mr-2" />
          ) : (
            <X className="size-4 text-gray-500 mr-2" />
          )}
          <span className={item.met ? "text-green-500" : "text-gray-400"}>
            {item.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

const PasswordStrengthMeter = ({ password }) => {
  const getStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++;
    if (pass.match(/\d/)) strength++;
    if (pass.match(/[^a-zA-Z\d]/)) strength++;
    return strength;
  };

  const strength = getStrength(password);

  const getColor = (strength) => {
    if (strength === 0) return "from-red-500 to-red-400";
    if (strength === 1) return "from-red-400 to-orange-400";
    if (strength === 2) return "from-yellow-500 to-yellow-400";
    if (strength === 3) return "from-green-400 to-green-500";
    return "from-green-500 to-green-600";
  };

  const getStrengthText = (strength) => {
    if (strength === 0) return "بسیار ضعیف";
    if (strength === 1) return "ضعیف";
    if (strength === 2) return "متوسط";
    if (strength === 3) return "خوب";
    return "قوی";
  };

  return (
    <div className="mt-2" dir="rtl">
      {/* Strength Text and Label */}
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400">قدرت رمز عبور</span>
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          
          className="text-xs font-semibold"
          style={{
            background: `linear-gradient(to right, ${getColor(strength)})`,
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          {getStrengthText(strength)}
        </motion.span>
      </div>

      {/* Strength Bar */}
      <div className="flex space-x-1">
        {[...Array(4)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`h-1 w-1/4 rounded-full transition-colors duration-300 
                              ${
                                index < strength
                                  ? `bg-gradient-to-r ${getColor(strength)}`
                                  : "bg-gray-600"
                              }
                          `}
          />
        ))}
      </div>

      {/* Password Criteria */}
      <PasswordCriteria password={password} />
    </div>
  );
};

export default PasswordStrengthMeter;
