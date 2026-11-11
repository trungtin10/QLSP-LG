import { Link } from "react-router-dom";
import { Home, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center bg-gray-50">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Không tìm thấy trang yêu cầu
      </h2>
      <p className="max-w-md text-gray-500 text-sm mb-8">
        Đường dẫn bạn đang truy cập không tồn tại hoặc đã bị di chuyển. Vui lòng quay về trang chủ.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
      >
        <Home className="w-4 h-4" />
        Về Trang Chủ
      </Link>
    </div>
  );
}
