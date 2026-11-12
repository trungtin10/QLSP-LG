import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { 
  Home, 
  Search, 
  Scan, 
  ShieldCheck, 
  User, 
  LogIn 
} from "lucide-react";

export default function MobileBottomNav({ onOpenScanner }) {
  const location = useLocation();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const isHome = location.pathname === "/home" || location.pathname === "/";
  const isAdminPath = location.pathname.startsWith("/admin");
  const isLogin = location.pathname === "/login" || location.pathname === "/admin/login";

  return (
    <nav 
      aria-label="Mobile Navigation" 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe"
    >
      <div className="grid grid-cols-5 items-center h-16 px-1">
        {/* 1. Trang Chủ */}
        <Link
          to="/home"
          className={`flex flex-col items-center justify-center gap-1 py-1 transition ${
            isHome && !location.search
              ? "text-blue-600 font-bold"
              : "text-gray-500 dark:text-slate-400 hover:text-blue-600"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Trang chủ</span>
        </Link>

        {/* 2. Tra Cứu Nhanh */}
        <Link
          to="/home"
          onClick={() => {
            // Cuộn mượt lên khung tìm kiếm
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex flex-col items-center justify-center gap-1 py-1 transition ${
            isHome && location.search
              ? "text-blue-600 font-bold"
              : "text-gray-500 dark:text-slate-400 hover:text-blue-600"
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Tra cứu</span>
        </Link>

        {/* 3. NÚT QUÉT MÃ QR NỔI BẬT Ở GIỮA */}
        <div className="flex flex-col items-center justify-center -mt-5">
          <button
            type="button"
            onClick={onOpenScanner}
            className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 active:scale-95 transition-transform cursor-pointer border-2 border-white dark:border-slate-900"
            title="Quét mã QR bằng Camera"
          >
            <Scan className="w-6 h-6" />
          </button>
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-1">
            Quét QR
          </span>
        </div>

        {/* 4. Quản trị (Admin) */}
        {isAdmin ? (
          <Link
            to="/admin/dashboard"
            className={`flex flex-col items-center justify-center gap-1 py-1 transition ${
              isAdminPath
                ? "text-purple-600 dark:text-purple-400 font-bold"
                : "text-gray-500 dark:text-slate-400 hover:text-purple-600"
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Quản trị</span>
          </Link>
        ) : (
          <Link
            to="/scan/TB-001"
            className="flex flex-col items-center justify-center gap-1 py-1 text-gray-500 dark:text-slate-400 hover:text-blue-600 transition"
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Hồ sơ số</span>
          </Link>
        )}

        {/* 5. Tài khoản / Đăng nhập */}
        {isAuthenticated ? (
          <Link
            to={isAdmin ? "/admin/users" : "/home"}
            className="flex flex-col items-center justify-center gap-1 py-1 text-gray-500 dark:text-slate-400 hover:text-blue-600 transition"
          >
            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
              {user?.fullName?.charAt(0) || user?.username?.charAt(0) || "U"}
            </div>
            <span className="text-[10px] tracking-tight truncate max-w-[50px]">
              {user?.fullName?.split(" ").pop() || "Tôi"}
            </span>
          </Link>
        ) : (
          <Link
            to="/login"
            className={`flex flex-col items-center justify-center gap-1 py-1 transition ${
              isLogin
                ? "text-blue-600 font-bold"
                : "text-gray-500 dark:text-slate-400 hover:text-blue-600"
            }`}
          >
            <LogIn className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Đăng nhập</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
