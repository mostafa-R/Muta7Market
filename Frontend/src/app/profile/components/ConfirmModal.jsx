// components/common/ConfirmModal.jsx
import React from "react";

const ConfirmModal = ({ title, message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fadeIn">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex gap-4">
        <button
          onClick={onCancel}
          className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
        >
          إلغاء
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3 bg-[#00183D] text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all"
        >
          تأكيد
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmModal;
