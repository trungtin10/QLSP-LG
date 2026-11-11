import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ShieldAlert, Loader2 } from "lucide-react";

export default function ProtectedRoute({ allowedRoles = ["superadmin", "admin"] }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm">Đang xác thực thông tin quyền hạn...</p>
      </div>
    );
  }

  // Chưa đăng nhập -> Chuyển về trang Login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Đã đăng nhập nhưng không đủ quyền (ví dụ role user muốn vào trang admin)
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quyền truy cập bị từ chối (403)</h1>
        <p className="max-w-md text-sm text-gray-600 mb-6">
          Tài khoản của bạn mang quyền <strong>[{user?.role}]</strong>, không có thẩm quyền truy cập vào phân khu quản trị này.
        </p>
        <a
          href="/"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition"
        >
          Quay về Trang Học Viên
        </a>
      </div>
    );
  }

  return <Outlet />;
}
