import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/Homepage"; 
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

// Admin & Auth Imports
import LoginPage from "./pages/admin/LoginPage";
import AdminLayout from "./layouts/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import ProductManagementPage from "./pages/admin/ProductManagementPage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import ScanAssetPage from "./pages/ScanAssetPage";
import MobileBottomNav from "./components/mobile/MobileBottomNav";
import MobileQrScannerModal from "./components/mobile/MobileQrScannerModal";

function RootRouter() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
        <p className="text-sm">Đang tải hệ thống GPLX...</p>
      </div>
    );
  }

  // Chưa đăng nhập -> Vào thẳng trang Login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Đã đăng nhập với tư cách Superadmin hoặc Admin -> Vào Dashboard quản trị
  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Đã đăng nhập với tư cách Học viên (User) -> Vào trang học tập
  return <Navigate to="/home" replace />;
}

// Bọc trang học viên với Navbar và Footer
function StudentPortal({ onOpenScanner }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 pb-16 md:pb-0">
      <Navbar onOpenScanner={onOpenScanner} />
      <main className="flex-1 flex flex-col">
        <HomePage onOpenScanner={onOpenScanner} />
      </main>
      <Footer />
    </div>
  );
}

function AppMain() {
  const [scannerOpen, setScannerOpen] = useState(false);

  return (
    <>
      <Routes>
        {/* ================= TRANG GỐC KHI VÀO WEB ================= */}
        <Route path="/" element={<RootRouter />} />

        {/* ================= ĐĂNG NHẬP ================= */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<LoginPage />} />

        {/* ================= TRANG QUÉT MÃ QR CÔNG KHAI ================= */}
        <Route path="/scan/:code" element={<ScanAssetPage />} />

        {/* ================= CỔNG HỌC VIÊN ================= */}
        <Route 
          path="/home" 
          element={<StudentPortal onOpenScanner={() => setScannerOpen(true)} />} 
        />

        {/* ================= KHU VỰC QUẢN TRỊ VIÊN (SUPERADMIN & ADMIN) ================= */}
        <Route element={<ProtectedRoute allowedRoles={["superadmin", "admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            
            {/* Quản lý Sản phẩm / Trang thiết bị theo 7 phòng ban & QR Code */}
            <Route path="products" element={<ProductManagementPage />} />

            {/* Quản lý Người dùng & Cập nhật trực tiếp trên MongoDB */}
            <Route path="users" element={<UserManagementPage />} />

            <Route
              path="*"
              element={
                <div className="p-8 text-center text-slate-400">
                  <h2 className="text-xl font-bold text-white mb-2">Tính năng đang được hoàn thiện</h2>
                  <p className="text-sm">Vui lòng quay lại Dashboard.</p>
                </div>
              }
            />
          </Route>
        </Route>

        {/* ================= TRANG 404 ================= */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 pb-16 md:pb-0">
              <Navbar onOpenScanner={() => setScannerOpen(true)} />
              <main className="flex-1 flex flex-col">
                <NotFound />
              </main>
              <Footer />
            </div>
          }
        />
      </Routes>

      {/* Thanh điều hướng đáy chuẩn Mobile App (Chỉ hiển thị trên điện thoại) */}
      <MobileBottomNav onOpenScanner={() => setScannerOpen(true)} />

      {/* Modal Quét Mã QR Camera Di Động */}
      <MobileQrScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
      />

      <Toaster richColors position="top-right" />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppMain />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
