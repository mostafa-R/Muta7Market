// components/profile/Sidebar.jsx
import React from "react";
import { FaUser, FaLock, FaCalendar, FaFileAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const Sidebar = ({
  activeSection,
  setActiveSection,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const menuItems = [
    { id: "profile", label: "الملف الشخصي", icon: FaUser },
    { id: "edit", label: "تعديل المعلومات", icon: FaLock },
    { id: "payments", label: "المدفوعات المعلقة", icon: FaCalendar },
    { id: "playerProfile", label: "الملف الشخصي", icon: FaFileAlt },
  ];

  const handleItemClick = (sectionId) => {
    setActiveSection(sectionId);
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 right-0 h-full lg:h-screen
          w-72 lg:w-64 xl:w-80
          bg-white shadow-xl lg:shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "translate-x-full lg:translate-x-0"
          }
          z-50 lg:z-30
          overflow-y-auto
        `}
      >
        <div className="p-6">
          {/* Mobile header */}
          <div className="flex justify-between items-center mb-8 lg:hidden">
            <h2 className="text-2xl font-bold text-gray-800">القائمة</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="إغلاق القائمة"
            >
              <IoMdClose size={24} />
            </button>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-xl xl:text-2xl font-bold text-gray-800">
              لوحة التحكم
            </h2>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    w-full text-right py-3 px-4 rounded-xl
                    flex items-center gap-3
                    text-sm lg:text-base
                    transition-all duration-200
                    ${
                      activeSection === item.id
                        ? "bg-[#00183D] text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <Icon className="text-lg" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
