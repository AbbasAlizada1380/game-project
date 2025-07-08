import React from "react";

const Header = () => {
  return (
    <header className="relative bg-gradient-to-br from-blue-100 to-blue-200 py-24 px-4 overflow-hidden text-center">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/connected.png')] opacity-10" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 drop-shadow-md leading-tight mb-4 animate-fade-in-up">
          سیستم مدیریت مارکیت حسین زاده
        </h1>
        <p className="text-lg md:text-xl text-gray-700 leading-relaxed animate-fade-in-up delay-200">
          به سیستم اطلاعاتی مارکت خوش آمدید. با استفاده از این سیستم، اطلاعات
          دقیق و به‌روز مارکت را دنبال کنید.
        </p>
      </div>
    </header>
  );
};

export default Header;
