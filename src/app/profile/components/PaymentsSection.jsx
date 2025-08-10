// components/profile/PaymentsSection.jsx
import React from "react";

const PaymentsSection = ({ payments, router }) => {
  const PaymentCard = ({ payment }) => (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
      <div className="bg-[#00183D] p-4">
        <h3 className="text-white font-semibold text-lg">{payment.itemName}</h3>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 flex items-center gap-2">
              <i className="fas fa-tag"></i>
              السعر
            </span>
            <span className="font-bold text-2xl text-purple-600">
              {payment.price} $
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 flex items-center gap-2">
              <i className="fas fa-calendar"></i>
              تاريخ الطلب
            </span>
            <span className="text-gray-800">
              {new Date(payment.orderDate).toLocaleDateString("ar-EG")}
            </span>
          </div>
        </div>
        <button
          onClick={() => router.push(`/payment/${payment.id}`)}
          className="mt-6 w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:from-green-600 hover:to-teal-600 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <i className="fas fa-credit-card"></i>
          استكمال الدفع
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-[#00183D] p-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <i className="fas fa-credit-card"></i>
          المدفوعات المعلقة
        </h1>
      </div>

      {/* Content */}
      <div className="p-6 lg:p-8">
        {payments.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 text-xl">لا توجد مدفوعات معلقة</p>
            <p className="text-gray-400 mt-2">جميع المدفوعات مكتملة</p>
          </div>
        ) : (
          <>
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-yellow-800 flex items-center gap-2">
                <i className="fas fa-info-circle"></i>
                لديك {payments.length} مدفوعات معلقة بإجمالي {payments.reduce((sum, p) => sum + p.price, 0)} $
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {payments.map((payment) => (
                <PaymentCard key={payment.id} payment={payment} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentsSection;
