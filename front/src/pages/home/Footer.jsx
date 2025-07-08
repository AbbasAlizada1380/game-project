import React from "react";

const Footer = () => {
  return (
    <footer className="bg-primary text-white pt-10 pb-5 px-6 mt-10" dir="rtl">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
        {/* Brand Info */}
        <div>
          <h3 className="text-xl font-bold mb-2">
            سیستم مدیریت مارکت حسین زاده
          </h3>
          <p className="text-sm text-blue-100">
            ابزاری دیجیتال برای مدیریت هوشمند دکان‌ها، کرایه‌ها و خدمات مارکت
            حسین زاده.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold mb-3">دسترسی سریع</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:underline text-blue-100">
                درباره ما
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline text-blue-100">
                تماس با ما
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline text-blue-100">
                خدمات
              </a>
            </li>
          </ul>
        </div>

        {/* Contact / Social */}
        <div>
          <h4 className="text-lg font-semibold mb-3">ارتباط با ما</h4>
          <p className="text-sm text-blue-100">
            <span> شماره تماس:</span>
            <span>0093729502724</span>
          </p>
          <div className="flex justify-center md:justify-end gap-4 mt-3">
            <span className="w-6 h-6 bg-red-500 rounded-full" />
            <span className="w-6 h-6 bg-green-500 rounded-full" />
            <span className="w-6 h-6 bg-black rounded-full" />
            {/* جایگزین با آیکون‌های واقعی در صورت نیاز */}
          </div>
        </div>
      </div>

      <div className="border-t border-blue-500 mt-8 pt-4 text-center text-xs text-blue-100">
        &copy; {new Date().getFullYear()} <span>TET</span> تمامی حقوق این سیستم
        محفوظ است.
      </div>
    </footer>
  );
};

export default Footer;
