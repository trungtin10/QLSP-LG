import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Car, ShieldCheck, LogOut, User } from "lucide-react";
import { toast } from "sonner";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.info("Đã đăng xuất khỏi tài khoản!");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:bg-blue-700 transition">
              <Car className="w-6 h-6" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-lg text-gray-900 leading-tight">
                GPLX VIỆT NAM
              </span>
              <span className="text-xs text-blue-600 font-medium">
                Hệ Thống Trực Tuyến
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6">
            <Link
              to="/home"
              className={`text-sm font-medium transition ${
                location.pathname === "/home"
                  ? "text-blue-600 font-semibold"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Trang chủ
            </Link>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Vào Quản Trị
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  {user?.fullName || user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
