import { AuthProvider } from '@/context/AuthContext.jsx';
import { SidebarProvider } from '@/context/SidebarContext.jsx';
import { ThemeProvider } from '@/context/ThemeContext.jsx';
import { Outfit } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <AuthProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}