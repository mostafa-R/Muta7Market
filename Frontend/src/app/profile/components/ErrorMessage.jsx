// components/common/ErrorMessage.jsx
import React from "react";

const ErrorMessage = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
      <i className="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">حدث خطأ</h2>
      <p className="text-gray-600">{message}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
      >
        إعادة المحاولة
      </button>
    </div>
  </div>
);

export default ErrorMessage;
