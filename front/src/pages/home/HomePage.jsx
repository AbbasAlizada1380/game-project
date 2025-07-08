import React from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Store, Wallet, Wrench } from "lucide-react";
import ImageSlider from "./ImageSlider";
import Header from "./Header";
import Footer from "./Footer";
import { MdAccountCircle } from "react-icons/md";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-gray-50 text-gray-800 font-sans relative"
      dir="rtl"
    >
      {/* دکمه ورود */}
      <button
        key="sign-in-button"
        onClick={() => navigate("/sign-in")}
        className="fixed top-4 left-7 flex items-center gap-2 bg-primary hover:bg-blue-700 text-white py-2 px-4 rounded shadow z-50"
      >
        <LogIn size={34} />
        <span>ورود به سیستم</span>
      </button>

      {/* هدر / معرفی */}
      <Header />
      <ImageSlider />
      {/* درباره مارکت */}
      <section className="py-16 px-6 max-w-5xl mx-auto text-right">
        <h2 className="text-2xl font-semibold text-center mb-8 text-blue-800">
          درباره مارکت ما
        </h2>
        <p className="text-gray-600 leading-relaxed">
          مارکت ما میزبان صدها فروشنده محلی است که از محصولات تازه گرفته تا
          وسایل الکترونیکی را عرضه می‌کنند. این سیستم مدیریت، برای ثبت اطلاعات
          دکان‌ها، کرایه‌ها، خدمات و مصارف به شکل دیجیتال طراحی شده است.
        </p>
      </section>

      {/* خدمات */}
      <section className="bg-white py-16 px-4 text-right">
        <h2 className="text-2xl font-semibold text-center mb-10 text-blue-800">
          خدمات سیستم
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: <Store size={32} className="text-blue-600 mb-4" />,
              title: "لیست دکان‌ها",
              desc: "مشاهده تمام دکان‌ها و صاحبان آنها.",
            },
            {
              icon: <Wallet size={32} className="text-blue-600 mb-4" />,
              title: "اطلاعات کرایه",
              desc: "مشخصات کرایه و زمان‌های پرداخت.",
            },
            {
              icon: <Wrench size={32} className="text-blue-600 mb-4" />,
              title: "خدمات ترمیمی",
              desc: "درخواست‌ها و مشکلات ترمیمی مارکت.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-gray-100 p-6 rounded-xl shadow hover:shadow-lg transition text-center"
            >
              {item.icon}
              <h3 className="text-xl font-bold mb-2 text-blue-800">
                {item.title}
              </h3>
              <p className="text-sm text-gray-700">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* آمار کلی مارکت */}
      <section className="py-16 px-6 max-w-6xl mx-auto text-right">
        <h2 className="text-2xl font-semibold text-center mb-10 text-blue-800">
          آمار کلی مارکت
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              img: "https://cdn-icons-png.flaticon.com/512/2210/2210184.png",
              label: "کل دکان‌ها",
              count: "۱۲۰",
              color: "bg-blue-100",
            },
            {
              img: "https://cdn-icons-png.flaticon.com/512/3652/3652191.png",
              label: "دکان‌های خالی",
              count: "۲۰",
              color: "bg-red-100",
            },
            {
              img: "https://cdn-icons-png.flaticon.com/512/2910/2910791.png",
              label: "دکان‌های فعال",
              count: "۹۰",
              color: "bg-green-100",
            },
            {
              img: "https://cdn-icons-png.flaticon.com/512/1828/1828945.png",
              label: "نیاز به ترمیم",
              count: "۱۰",
              color: "bg-yellow-100",
            },
          ].map((item, index) => (
            <div
              key={index}
              className={`${item.color} rounded-xl shadow p-5 flex flex-col items-center text-center hover:shadow-lg transition`}
            >
              <img src={item.img} alt={item.label} className="w-12 h-12 mb-4" />
              <p className="text-3xl font-bold text-blue-700">{item.count}</p>
              <p className="text-sm text-gray-700 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* فوتر */}
      <Footer />
    </div>
  );
};

export default HomePage;
