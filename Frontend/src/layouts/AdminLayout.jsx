import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  LayoutDashboard, 
  Package,
  Users, 
  ShieldCheck, 
  LogOut, 
  Crown, 
  User, 
  ExternalLink 
} from "lucide-react";
import { toast } from "sonner";

export default function AdminLayout() {
  const { user, isSuperAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info("Đã đăng xuất khỏi phiên quản trị!");
    navigate("/admin/login");
  };

  // Menu items for the sidebar navigation
  const menuItems = [
    { label: "Tổng quan Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Thiết bị & Sản phẩm (QR)", path: "/admin/products", icon: Package },
    { label: "Quản lý Người dùng", path: "/admin/users", icon: Users },
  ];

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        {/* Brand */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-white tracking-wide">GPLX PORTAL</p>
              <p className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">System Admin</p>
            </div>
          </Link>
        </div>

        {/* User Info & Role Badge */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-semibold border border-slate-700">
              {user?.fullName?.charAt(0) || <User className="w-5 h-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{user?.fullName || user?.username}</p>
              <div className="mt-0.5">
                {isSuperAdmin ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800/60 uppercase">
                    <Crown className="w-3 h-3 text-purple-400" />
                    Superadmin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800/60 uppercase">
                    <ShieldCheck className="w-3 h-3 text-blue-400" />
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                  active
                    ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800/80 space-y-1">
          <Link
            to="/home"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              Xem trang Học viên
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/40 hover:text-red-300 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 px-6 border-b border-slate-800 bg-slate-950/60 backdrop-blur-md flex items-center justify-between sticky top-0 z-40">
          <div>
            <h1 className="text-base font-semibold text-white">Bảng Điều Khiển Quản Trị</h1>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>Máy chủ API: <strong className="text-emerald-400">Online</strong></span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </div>
        </header>

        <main className="p-6 flex-1 bg-slate-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
