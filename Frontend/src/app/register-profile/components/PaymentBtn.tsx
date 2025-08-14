"use client";

import {
  Building2,
  Calendar,
  CheckCircle,
  CreditCard,
  Lock,
  Mail,
  Phone,
  Shield,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type UserLS = {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  mobile?: string;
};

// Custom Payment Modal Component
const PaymentModal = ({
  isOpen,
  onClose,
  paymentUrl,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  paymentUrl: string;
  onSuccess: () => void;
}) => {
  const [selectedMethod, setSelectedMethod] = useState("credit_card");
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    holderName: "",
    email: "",
    phone: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
      toast.success("تم الدفع بنجاح!");
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto border border-gray-100">
        {/* Header */}
        <div className="bg-[#00183D] p-8 text-white relative rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-6 left-6 text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-4 mb-3">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3">
              <CreditCard size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">إتمام الدفع</h2>
              <p className="text-white/90 text-sm mt-1">
                أكمل عملية الدفع لتفعيل اشتراكك
              </p>
            </div>
          </div>
        </div>

        {/* Payment Content */}
        <div className="p-8">
          {/* Payment Summary */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-6 mb-8 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-[#00183D] rounded-xl p-2">
                  <Building2 size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    تسجيل لاعب محترف
                  </h3>
                  <p className="text-sm text-gray-600">اشتراك</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#00183D]">55 USD</div>
                <div className="flex items-center gap-2 text-green-600 text-sm mt-1">
                  <Shield size={14} />
                  <span>دفع آمن</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              اختر طريقة الدفع
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <button
                onClick={() => setSelectedMethod("credit_card")}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                  selectedMethod === "credit_card"
                    ? "border-[#00183D] bg-blue-50/50 shadow-lg"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`p-2 rounded-lg ${
                      selectedMethod === "credit_card"
                        ? "bg-[#00183D] text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      بطاقة ائتمان
                    </h4>
                    <p className="text-xs text-gray-600">Visa, Mastercard</p>
                  </div>
                </div>
                {selectedMethod === "credit_card" && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-[#00183D] rounded-full"></div>
                )}
              </button>

              <button
                onClick={() => setSelectedMethod("mada")}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                  selectedMethod === "mada"
                    ? "border-[#00183D] bg-blue-50/50 shadow-lg"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`p-2 rounded-lg ${
                      selectedMethod === "mada"
                        ? "bg-[#00183D] text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">مدى</h4>
                    <p className="text-xs text-gray-600">Mada Card</p>
                  </div>
                </div>
                {selectedMethod === "mada" && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-[#00183D] rounded-full"></div>
                )}
              </button>

              <button
                onClick={() => setSelectedMethod("stc_pay")}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                  selectedMethod === "stc_pay"
                    ? "border-[#00183D] bg-blue-50/50 shadow-lg"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`p-2 rounded-lg ${
                      selectedMethod === "stc_pay"
                        ? "bg-[#00183D] text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      STC Pay
                    </h4>
                    <p className="text-xs text-gray-600">محفظة رقمية</p>
                  </div>
                </div>
                {selectedMethod === "stc_pay" && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-[#00183D] rounded-full"></div>
                )}
              </button>

              <button
                onClick={() => setSelectedMethod("apple_pay")}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                  selectedMethod === "apple_pay"
                    ? "border-[#00183D] bg-blue-50/50 shadow-lg"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`p-2 rounded-lg ${
                      selectedMethod === "apple_pay"
                        ? "bg-[#00183D] text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Shield size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      Apple Pay
                    </h4>
                    <p className="text-xs text-gray-600">آبل باي</p>
                  </div>
                </div>
                {selectedMethod === "apple_pay" && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-[#00183D] rounded-full"></div>
                )}
              </button>

              <button
                onClick={() => setSelectedMethod("urpay")}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                  selectedMethod === "urpay"
                    ? "border-[#00183D] bg-blue-50/50 shadow-lg"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`p-2 rounded-lg ${
                      selectedMethod === "urpay"
                        ? "bg-[#00183D] text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      urPay
                    </h4>
                    <p className="text-xs text-gray-600">يور باي</p>
                  </div>
                </div>
                {selectedMethod === "urpay" && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-[#00183D] rounded-full"></div>
                )}
              </button>

              <button
                onClick={() => setSelectedMethod("alinma_pay")}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                  selectedMethod === "alinma_pay"
                    ? "border-[#00183D] bg-blue-50/50 shadow-lg"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`p-2 rounded-lg ${
                      selectedMethod === "alinma_pay"
                        ? "bg-[#00183D] text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      Alinma Pay
                    </h4>
                    <p className="text-xs text-gray-600">الإنماء باي</p>
                  </div>
                </div>
                {selectedMethod === "alinma_pay" && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-[#00183D] rounded-full"></div>
                )}
              </button>

              <button
                onClick={() => setSelectedMethod("riyadh_bank")}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                  selectedMethod === "riyadh_bank"
                    ? "border-[#00183D] bg-blue-50/50 shadow-lg"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`p-2 rounded-lg ${
                      selectedMethod === "riyadh_bank"
                        ? "bg-[#00183D] text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      بنك الرياض
                    </h4>
                    <p className="text-xs text-gray-600">Riyadh Bank</p>
                  </div>
                </div>
                {selectedMethod === "riyadh_bank" && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-[#00183D] rounded-full"></div>
                )}
              </button>

              <button
                onClick={() => setSelectedMethod("bank_transfer")}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                  selectedMethod === "bank_transfer"
                    ? "border-[#00183D] bg-blue-50/50 shadow-lg"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`p-3 rounded-xl ${
                      selectedMethod === "bank_transfer"
                        ? "bg-[#00183D] text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      تحويل بنكي
                    </h4>
                    <p className="text-xs text-gray-600">
                      جميع البنوك السعودية
                    </p>
                  </div>
                </div>
                {selectedMethod === "bank_transfer" && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-[#00183D] rounded-full"></div>
                )}
              </button>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmitPayment} className="space-y-6">
            {(selectedMethod === "credit_card" ||
              selectedMethod === "mada") && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h4 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <CreditCard size={20} className="text-[#00183D]" />
                  {selectedMethod === "mada"
                    ? "معلومات بطاقة مدى"
                    : "معلومات البطاقة"}
                </h4>

                <div className="space-y-5">
                  {/* Card Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      رقم البطاقة
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.cardNumber}
                        onChange={(e) =>
                          handleInputChange(
                            "cardNumber",
                            formatCardNumber(e.target.value)
                          )
                        }
                        placeholder="1234 5678 9012 3456"
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00183D]/20 focus:border-[#00183D] transition-all text-lg font-mono"
                        maxLength={19}
                        required
                      />
                      <CreditCard
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                    </div>
                  </div>

                  {/* Expiry and CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        تاريخ الانتهاء
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.expiryDate}
                          onChange={(e) =>
                            handleInputChange(
                              "expiryDate",
                              formatExpiryDate(e.target.value)
                            )
                          }
                          placeholder="MM/YY"
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00183D]/20 focus:border-[#00183D] transition-all text-lg font-mono"
                          maxLength={5}
                          required
                        />
                        <Calendar
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        رمز الأمان
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.cvv}
                          onChange={(e) =>
                            handleInputChange(
                              "cvv",
                              e.target.value.replace(/\D/g, "")
                            )
                          }
                          placeholder="123"
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00183D]/20 focus:border-[#00183D] transition-all text-lg font-mono"
                          maxLength={4}
                          required
                        />
                        <Lock
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cardholder Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      اسم حامل البطاقة
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.holderName}
                        onChange={(e) =>
                          handleInputChange("holderName", e.target.value)
                        }
                        placeholder="الاسم كما يظهر على البطاقة"
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00183D]/20 focus:border-[#00183D] transition-all text-lg"
                        required
                      />
                      <User
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === "stc_pay" && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
                <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                  <Phone size={20} />
                  الدفع عبر STC Pay
                </h4>
                <div className="bg-white rounded-xl p-5">
                  <div className="text-center py-6">
                    <div className="text-6xl mb-4">📱</div>
                    <h5 className="font-semibold text-gray-900 mb-2">
                      ادفع بسهولة عبر STC Pay
                    </h5>
                    <p className="text-sm text-gray-600 mb-4">
                      سيتم توجيهك لتطبيق STC Pay لإتمام عملية الدفع بأمان
                    </p>
                    <div className="bg-purple-100 rounded-lg p-3 text-sm text-purple-800">
                      💡 تأكد من تثبيت تطبيق STC Pay على هاتفك
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === "apple_pay" && (
              <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield size={20} />
                  الدفع عبر Apple Pay
                </h4>
                <div className="bg-white rounded-xl p-5">
                  <div className="text-center py-6">
                    <div className="text-6xl mb-4">🍎</div>
                    <h5 className="font-semibold text-gray-900 mb-2">
                      ادفع بلمسة واحدة
                    </h5>
                    <p className="text-sm text-gray-600 mb-4">
                      استخدم Touch ID أو Face ID لإتمام عملية الدفع بسرعة وأمان
                    </p>
                    <div className="bg-blue-100 rounded-lg p-3 text-sm text-blue-800">
                      📲 متاح على أجهزة iPhone و iPad و Mac
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(selectedMethod === "urpay" ||
              selectedMethod === "alinma_pay" ||
              selectedMethod === "riyadh_bank") && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Building2 size={20} />
                  {selectedMethod === "urpay" && "الدفع عبر urPay"}
                  {selectedMethod === "alinma_pay" && "الدفع عبر الإنماء باي"}
                  {selectedMethod === "riyadh_bank" && "الدفع عبر بنك الرياض"}
                </h4>
                <div className="bg-white rounded-xl p-5">
                  <div className="text-center py-6">
                    <div className="text-6xl mb-4">🏦</div>
                    <h5 className="font-semibold text-gray-900 mb-2">
                      {selectedMethod === "urpay" &&
                        "ادفع عبر محفظة urPay الرقمية"}
                      {selectedMethod === "alinma_pay" &&
                        "ادفع عبر تطبيق الإنماء"}
                      {selectedMethod === "riyadh_bank" &&
                        "ادفع عبر تطبيق بنك الرياض"}
                    </h5>
                    <p className="text-sm text-gray-600 mb-4">
                      سيتم توجيهك لتطبيق البنك لإتمام عملية الدفع بأمان تام
                    </p>
                    <div className="bg-green-100 rounded-lg p-3 text-sm text-green-800">
                      ✅ دفع آمن ومعتمد من البنك المركزي السعودي
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === "bank_transfer" && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Building2 size={20} />
                  تفاصيل التحويل البنكي
                </h4>
                <div className="bg-white rounded-xl p-5 space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">اسم البنك:</span>
                    <span className="font-semibold text-gray-900">
                      البنك الأهلي السعودي
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">رقم الحساب:</span>
                    <span className="font-mono text-gray-900">
                      SA1234567890123456789
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">اسم المستفيد:</span>
                    <span className="font-semibold text-gray-900">
                      شركة موقع اللاعبين
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">المبلغ:</span>
                    <span className="font-bold text-[#00183D] text-lg">
                      55 USD
                    </span>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-sm text-yellow-800 font-medium">
                    📱 يرجى إرسال إيصال التحويل عبر الواتساب: 966501234567
                  </p>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h4 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Mail size={20} className="text-[#00183D]" />
                معلومات الاتصال
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="example@email.com"
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00183D]/20 focus:border-[#00183D] transition-all"
                      required
                    />
                    <Mail
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    رقم الهاتف
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="966501234567"
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00183D]/20 focus:border-[#00183D] transition-all"
                      required
                    />
                    <Phone
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full py-5 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                  isProcessing
                    ? "bg-gray-300 cursor-not-allowed text-gray-500"
                    : "bg-[#00183D] hover:bg-[#00183D] text-white shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    جارٍ معالجة الدفع...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <CreditCard size={22} />
                    {selectedMethod === "credit_card" ||
                    selectedMethod === "mada"
                      ? "ادفع 55 USD الآن"
                      : selectedMethod === "bank_transfer"
                      ? "تأكيد التحويل"
                      : "ادفع 55 USD"}
                  </div>
                )}
              </button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 rounded-xl p-2">
                <Shield className="text-green-600" size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-green-900 mb-2">
                  الأمان والحماية
                </h4>
                <p className="text-sm text-green-700 leading-relaxed">
                  جميع المعاملات محمية بتشفير SSL 256-bit وتتم معالجتها عبر
                  Paylink.sa المعتمد من البنك المركزي السعودي. بياناتك آمنة
                  100%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Success Modal Component
const SuccessModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border border-gray-100">
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            تم الدفع بنجاح! 🎉
          </h2>
          <p className="text-gray-600 leading-relaxed">
            تم تفعيل اشتراكك بنجاح. يمكنك الآن الاستفادة من جميع المزايا
            والخدمات المتاحة.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
        >
          متابعة إلى الملف الشخصي
        </button>
      </div>
    </div>
  );
};

export default function PaymentBtn() {
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  const FRONT_BASE =
    process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

  const [loading, setLoading] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // اقرا التوكن واليوزر
  const { token, user } = useMemo(() => {
    let t = "";
    let u: UserLS = {};
    try {
      t = localStorage.getItem("token") || "";
    } catch {}
    try {
      u = JSON.parse(localStorage.getItem("user") || "{}") as UserLS;
    } catch {}
    return { token: t, user: u };
  }, []);

  // Polling على حالة الدفع
  useEffect(() => {
    if (!paymentId) return;

    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(`${API_BASE}/payments/${paymentId}/status`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        const j = await r.json();
        const status = String(j?.data?.status || "").toUpperCase();

        if (status.includes("COMPLETED")) {
          if (pollRef.current) clearInterval(pollRef.current);
          setShowPaymentModal(false);
          setShowSuccessModal(true);
          toast.success("تم الدفع بنجاح ✅ – تم تفعيل اشتراكك");
        } else if (status.includes("FAILED") || status.includes("CANCELLED")) {
          if (pollRef.current) clearInterval(pollRef.current);
          toast.error("فشل الدفع ❌ — حاول مرة أخرى");
          setShowPaymentModal(false);
        }
      } catch {
        // تجاهل أثناء polling
      }
    }, 3500);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [paymentId, API_BASE, token]);

  const startPayment = async () => {
    setLoading(true);

    const promise = (async () => {
      const body = {
        type: "promote_player",
        currency: "USD",
        description: "Player Registration Subscription",
        metadata: {
          name: user?.name || "",
          email: user?.email || "",
          mobile: user?.mobile || "",
          source: "player-registration",
        },
      };

      const res = await fetch(`${API_BASE}/payments/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      // Handle specific error cases
      if (!res.ok) {
        if (res.status === 429) {
          throw new Error(
            "تم تجاوز حد المحاولات. يرجى المحاولة مرة أخرى خلال دقائق"
          );
        } else if (res.status === 401) {
          throw new Error("يرجى تسجيل الدخول أولاً");
        } else if (res.status === 400) {
          throw new Error(json?.message || "بيانات الطلب غير صحيحة");
        } else if (res.status >= 500) {
          throw new Error("خطأ في الخادم. يرجى المحاولة لاحقاً");
        } else {
          throw new Error(json?.message || "فشل إنشاء الفاتورة");
        }
      }

      const pId = json?.data?.paymentId;
      const url = json?.data?.paymentUrl;
      if (!pId || !url) throw new Error("لم نستلم رابط الدفع");

      setPaymentId(pId);
      setPaymentUrl(url);
      setShowPaymentModal(true);
      return "تم إنشاء الفاتورة بنجاح";
    })();

    toast.promise(promise, {
      loading: "جارٍ تجهيز الدفع…",
      success: (msg) => msg,
      error: (e) => e?.message || "حدث خطأ غير متوقع",
    });

    try {
      await promise;
    } catch (error) {
      console.error("Payment initiation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    // Redirect to profile or refresh page
    setTimeout(() => {
      window.location.href = `${FRONT_BASE}/profile`;
    }, 500);
  };

  return (
    <>
      <div className="space-y-4">
        <button
          onClick={startPayment}
          disabled={loading}
          className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg ${
            loading
              ? "bg-gray-300 cursor-not-allowed text-gray-500"
              : "bg-[#00183D] hover:bg-[#00183D] text-white hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          }`}
        >
          {loading && (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          <CreditCard size={24} />
          {loading ? "جارٍ التفعيل…" : "ادفع 55 USD - تفعيل الاشتراك"}
        </button>

        <div className="text-center text-sm text-gray-500">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield size={16} />
            <span>دفع آمن ومضمون</span>
          </div>
          <p>نموذج دفع متقدم وآمن 100%</p>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentUrl && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          paymentUrl={paymentUrl}
          onSuccess={() => setShowSuccessModal(true)}
        />
      )}

      {/* Success Modal */}
      <SuccessModal isOpen={showSuccessModal} onClose={handleSuccessClose} />
    </>
  );
}
