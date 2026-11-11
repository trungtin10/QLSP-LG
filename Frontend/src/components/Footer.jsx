import { Car, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 mt-auto border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white font-semibold">Hệ thống Ôn Thi & Đổi GPLX Trực Tuyến</p>
              <p className="text-xs text-gray-400">Đồng hành cùng bạn trên mọi nẻo đường an toàn</p>
            </div>
          </div>

          <div className="text-sm">
            © {new Date().getFullYear()} GPLX Việt Nam. Tất cả quyền được bảo lưu.
          </div>
        </div>
      </div>
    </footer>
  );
}
