import { useAuth } from "../../contexts/AuthContext";
import { ShieldCheck, Crown, Package, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const { user, isSuperAdmin } = useAuth();

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border ${
        isSuperAdmin 
          ? "bg-gradient-to-r from-purple-950/70 via-slate-900 to-slate-900 border-purple-800/60" 
          : "bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 border-blue-800/60"
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Xin chào, {user?.fullName || user?.username}!
              </h2>
              {isSuperAdmin ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-900 text-purple-200 border border-purple-700">
                  <Crown className="w-3.5 h-3.5 text-purple-300" />
                  SUPERADMIN
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-900 text-blue-200 border border-blue-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Chào mừng bạn đến với Bảng điều khiển Quản trị hệ thống GPLX.
            </p>
          </div>
          <div className="text-xs text-slate-400 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700 shrink-0">
            Tài khoản: <strong className="text-white">{user?.username || user?.email}</strong>
          </div>
        </div>
      </div>

      {/* Quick Launch Card: Quản lý thiết bị theo 7 phòng ban & QR */}
      <div className="p-8 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Quản Lý Sản Phẩm & Trang Thiết Bị (7 Phòng Ban)</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Hệ thống quản lý trang thiết bị đồ điện tử tin học, máy chấm thi, cabin mô phỏng, xe sát hạch... Tự động sinh mã QR Code để quét kiểm tra tức thì và in tem dán.
            </p>
          </div>
        </div>

        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition shrink-0 cursor-pointer"
        >
          Mở Quản Lý Thiết Bị
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
