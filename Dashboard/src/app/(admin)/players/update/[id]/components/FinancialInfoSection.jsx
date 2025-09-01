"use client";

import { currencyOptions } from "../playerOptions";

export default function FinancialInfoSection({ formData, handleInputChange }) {
  return (
    <>
      {/* Salary Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center space-x-3 space-x-reverse mb-8">
          <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded-xl">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">معلومات الراتب</h3>
            <p className="text-sm text-gray-500 mt-1">الرواتب والمكافآت المالية</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Salary */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              الراتب الشهري
            </label>
            <div className="flex space-x-2 space-x-reverse">
              <input
                type="number"
                name="monthlySalary.amount"
                value={formData.monthlySalary.amount}
                onChange={handleInputChange}
                min="0"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                placeholder="المبلغ"
              />
              <select
                name="monthlySalary.currency"
                value={formData.monthlySalary.currency}
                onChange={handleInputChange}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
              >
                {currencyOptions.map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Yearly Salary */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              الراتب السنوي
            </label>
            <div className="flex space-x-2 space-x-reverse">
              <input
                type="number"
                name="yearSalary.amount"
                value={formData.yearSalary.amount}
                onChange={handleInputChange}
                min="0"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                placeholder="المبلغ"
              />
              <select
                name="yearSalary.currency"
                value={formData.yearSalary.currency}
                onChange={handleInputChange}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
              >
                {currencyOptions.map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contract End Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              تاريخ انتهاء العقد
            </label>
            <input
              type="date"
              name="contractEndDate"
              value={formData.contractEndDate}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Transfer Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center space-x-3 space-x-reverse mb-8">
          <div className="flex items-center justify-center w-10 h-10 bg-orange-50 rounded-xl">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">معلومات الانتقال</h3>
            <p className="text-sm text-gray-500 mt-1">تفاصيل العقود والانتقالات</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Transfer Club */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              النادي المنتقل إليه
            </label>
            <input
              type="text"
              name="transferredTo.club"
              value={formData.transferredTo.club}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
              placeholder="اسم النادي"
            />
          </div>

          {/* Transfer Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              مبلغ الانتقال
            </label>
            <input
              type="number"
              name="transferredTo.amount"
              value={formData.transferredTo.amount}
              onChange={handleInputChange}
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
              placeholder="المبلغ"
            />
          </div>

          {/* Transfer Start Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              تاريخ بداية الانتقال
            </label>
            <input
              type="date"
              name="transferredTo.startDate"
              value={formData.transferredTo.startDate}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
            />
          </div>

          {/* Transfer End Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              تاريخ نهاية الانتقال
            </label>
            <input
              type="date"
              name="transferredTo.endDate"
              value={formData.transferredTo.endDate}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
            />
          </div>
        </div>
      </div>
    </>
  );
}
