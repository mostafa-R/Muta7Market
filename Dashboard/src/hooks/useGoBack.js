import { useRouter } from "next/navigation";

const useGoBack = () => {
  const router = useRouter();

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back(); // ارجع للصفحة السابقة
    } else {
      router.push("/"); // لو مفيش history روح للـ Home
    }
  };

  return goBack;
};

export default useGoBack;
