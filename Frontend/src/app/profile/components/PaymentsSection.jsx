import PaymentBtn from "@/app/register-profile/components/PaymentBtn";
import { PlayerSchema } from "./validation";

const PaymentsSection = ({ payments, router }) => {
  // ترجمة القيم إلى العربية
  const translateJop = (jop) => {
    return jop === "player"
      ? "لاعب"
      : jop === "coach"
      ? "مدرب"
      : jop || "غير متوفر";
  };

  const translateStatus = (status) => {
    switch (status) {
      case "available":
        return "متاح";
      case "contracted":
        return "متعاقد";
      case "transferred":
        return "منقول";
      default:
        return status || "غير متوفر";
    }
  };

  const PaymentCard = ({ payment }) => {
    // التحقق من صحة البيانات باستخدام PlayerSchema
    const { error } = PlayerSchema.validate(payment, { abortEarly: false });
    if (error) {
      
      console.error(
        "Validation error in PaymentCard:",
        error.details.map((detail) => ({
          path: detail.path.join("."),
          message: detail.message,
        }))
      );
    }

    // تحديد القيم الافتراضية للحقول المفقودة
    const safePayment = {
      _id: payment._id || "",
      name:
        typeof payment.name === "string"
          ? { ar: payment.name, en: "" }
          : payment.name || { ar: "غير متوفر", en: "" },
      position:
        typeof payment.position === "string"
          ? { ar: payment.position, en: "" }
          : payment.position || { ar: "غير متوفر", en: "" },
      monthlySalary: payment.monthlySalary || { amount: 0, currency: "SAR" },
      yearSalary: payment.yearSalary || { amount: 0, currency: "SAR" },
      nationality: payment.nationality || "غير متوفر",
      jop: payment.jop || null,
      status: payment.status || null,
      isActive: payment.isActive || false,
      game: payment.game || "غير متوفر",
      contactInfo: payment.contactInfo || { email: null, phone: null },
      media: payment.media || { profileImage: { url: null, publicId: null } },
    };

    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl overflow-hidden w-full">
        <div className="bg-[#00183D] p-4 flex items-center gap-4">
          {safePayment.media?.profileImage?.url ? (
            <img
              src={safePayment.media.profileImage.url}
              alt={safePayment.name.ar}
              className="w-16 h-16 rounded-full object-cover"
              onError={(e) => (e.target.src = "/default-profile.png")} // صورة افتراضية
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <i className="fas fa-user text-gray-500 text-2xl"></i>
            </div>
          )}
          <h3 className="text-white font-semibold text-lg">
            {safePayment.name.ar}
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <i className="fas fa-money-bill-wave"></i>
                  الراتب الشهري
                </span>
                <span className="font-bold text-purple-600">
                  {safePayment.monthlySalary.amount}{" "}
                  {safePayment.monthlySalary.currency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <i className="fas fa-money-check-alt"></i>
                  الراتب السنوي
                </span>
                <span className="font-bold text-purple-600">
                  {safePayment.yearSalary.amount}{" "}
                  {safePayment.yearSalary.currency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <i className="fas fa-flag"></i>
                  الجنسية
                </span>
                <span className="text-gray-800">{safePayment.nationality}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <i className="fas fa-briefcase"></i>
                  الوظيفة
                </span>
                <span className="text-gray-800">
                  {translateJop(safePayment.jop)}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <i className="fas fa-map-marker-alt"></i>
                  المركز
                </span>
                <span className="text-gray-800">{safePayment.position.ar}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <i className="fas fa-info-circle"></i>
                  الحالة
                </span>
                <span className="text-gray-800">
                  {translateStatus(safePayment.status)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <i className="fas fa-toggle-on"></i>
                  نشط
                </span>
                <span className="text-gray-800">
                  {safePayment.isActive ? "نعم" : "لا"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <i className="fas fa-futbol"></i>
                  اللعبة
                </span>
                <span className="text-gray-800">{safePayment.game}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-3 border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-2">
                <i className="fas fa-envelope"></i>
                البريد الإلكتروني
              </span>
              <span className="text-gray-800">
                {safePayment.contactInfo.email || "غير متوفر"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-2">
                <i className="fas fa-phone"></i>
                الهاتف
              </span>
              <span className="text-gray-800">
                {safePayment.contactInfo.phone || "غير متوفر"}
              </span>
            </div>
          </div>
          <button
            onClick={() =>
              router.push(`/register-profile?id=${safePayment._id}`)
            }
            className="mt-6 w-full py-3 bg-[#00183D] text-white rounded-xl hover:bg-[#00183D]/80 transition-all flex items-center justify-center gap-2 font-medium"
          >
            <i className="fas fa-eye"></i>
            عرض التفاصيل
          </button>
          <div className="mt-4 w-full">
            <PaymentBtn />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-[#00183D] p-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <i className="fas fa-credit-card"></i>
          بيانات المدربين
        </h1>
      </div>

      {/* Content */}
      <div className="p-6 lg:p-8">
        {payments.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 text-xl">لا توجد بيانات متاحة</p>
          </div>
        ) : (
          <>
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-yellow-800 flex items-center gap-2">
                <i className="fas fa-info-circle"></i>
                لديك {payments.length} سجل
              </p>
            </div>
            <div
              className={`grid ${
                payments.length === 1
                  ? "grid-cols-1"
                  : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              } gap-6`}
            >
              {payments.map((payment) => (
                <PaymentCard key={payment._id} payment={payment} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentsSection;
