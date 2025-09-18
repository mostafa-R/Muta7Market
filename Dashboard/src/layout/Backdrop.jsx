import { useSidebar } from "@/context/SidebarContext";

const Backdrop = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm lg:hidden transition-all duration-500 ease-out"
      onClick={toggleMobileSidebar}
    />
  );
};

export default Backdrop;
