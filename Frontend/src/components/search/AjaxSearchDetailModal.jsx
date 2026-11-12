import React from "react";
import { 
  X, 
  Building2, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  Car, 
  ExternalLink,
  Layers,
  Copy,
  Check
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

const STATUS_CONFIG = {
  "active": { label: "Đang hoạt động tốt", color: "bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:text-emerald-400 dark:border-emerald-500/30", dot: "bg-emerald-500", icon: CheckCircle2 },
  "Hoạt động": { label: "Đang hoạt động tốt", color: "bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:text-emerald-400 dark:border-emerald-500/30", dot: "bg-emerald-500", icon: CheckCircle2 },
  "maintenance": { label: "Đang bảo trì định kỳ", color: "bg-amber-500/10 text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-500/30", dot: "bg-amber-500", icon: AlertCircle },
  "Đang bảo trì": { label: "Đang bảo trì định kỳ", color: "bg-amber-500/10 text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-500/30", dot: "bg-amber-500", icon: AlertCircle },
  "storage": { label: "Dự phòng / Lưu kho", color: "bg-blue-500/10 text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-500/30", dot: "bg-blue-500", icon: CheckCircle2 },
  "Dự phòng": { label: "Dự phòng / Lưu kho", color: "bg-blue-500/10 text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-500/30", dot: "bg-blue-500", icon: CheckCircle2 },
  "broken": { label: "Đang báo hỏng", color: "bg-rose-500/10 text-rose-600 border-rose-300 dark:text-rose-400 dark:border-rose-500/30", dot: "bg-rose-500", icon: AlertCircle },
  "Hỏng": { label: "Đang báo hỏng", color: "bg-rose-500/10 text-rose-600 border-rose-300 dark:text-rose-400 dark:border-rose-500/30", dot: "bg-rose-500", icon: AlertCircle },
  "Thanh lý": { label: "Đã thanh lý", color: "bg-gray-500/10 text-gray-600 border-gray-300 dark:text-gray-400 dark:border-gray-500/30", dot: "bg-gray-500", icon: AlertCircle },
};

export default function AjaxSearchDetailModal({ product, onClose }) {
  const [copied, setCopied] = React.useState(false);

  if (!product) return null;

  const statusInfo = STATUS_CONFIG[product.status] || STATUS_CONFIG["Hoạt động"];
  const StatusIcon = statusInfo.icon;
  const scanUrl = `${window.location.origin}/scan/${encodeURIComponent(product.code)}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(product.code);
    setCopied(true);
    toast.success(`Đã sao chép mã [${product.code}] vào bộ nhớ tạm!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-lg bg-white/20 backdrop-blur-md text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-1.5">
              <span>{product.code}</span>
              <button 
                onClick={handleCopyCode} 
                title="Sao chép mã" 
                className="hover:text-blue-200 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </span>

            <span className="px-2.5 py-0.5 rounded-md bg-blue-900/60 text-blue-200 text-xs font-medium">
              {product.category || "Thiết bị GPLX"}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold leading-tight">
            {product.name}
          </h2>

          <p className="text-blue-100/90 text-xs sm:text-sm mt-1 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-300 shrink-0" />
            {product.department || "Chưa phân phòng ban"}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Trạng thái & Cơ cấu số lượng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <span className="text-xs text-gray-500 font-medium block mb-2">Trạng thái hiện tại</span>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${statusInfo.color}`}>
                <span className={`w-2 h-2 rounded-full ${statusInfo.dot} animate-pulse`} />
                <StatusIcon className="w-4 h-4" />
                <span>{statusInfo.label}</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <span className="text-xs text-gray-500 font-medium block mb-2">Cơ cấu số lượng</span>
              <div className="flex items-center gap-3">
                <div className="text-2xl font-extrabold text-gray-900">
                  {product.quantity || 1}
                </div>
                <div className="text-xs text-gray-500 flex flex-wrap gap-2">
                  <span className="text-emerald-600 font-medium">Hoạt động: {product.quantityActive ?? product.quantity ?? 1}</span>
                  {Boolean(product.quantityMaintenance) && (
                    <span className="text-amber-600 font-medium">Bảo trì: {product.quantityMaintenance}</span>
                  )}
                  {Boolean(product.quantityStorage) && (
                    <span className="text-blue-600 font-medium">Kho: {product.quantityStorage}</span>
                  )}
                  {Boolean(product.quantityBroken) && (
                    <span className="text-rose-600 font-medium">Hỏng: {product.quantityBroken}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Chi tiết định danh & kỹ thuật */}
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 shadow-xs">
            {product.assignedVehicle && (
              <div className="p-3.5 flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-500 flex items-center gap-2">
                  <Car className="w-4 h-4 text-blue-600" />
                  Xe sát hạch / Biển số:
                </span>
                <span className="font-bold text-gray-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  {product.assignedVehicle}
                </span>
              </div>
            )}

            {product.serialNumber && (
              <div className="p-3.5 flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-500 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  Số Serial / IMEI:
                </span>
                <span className="font-mono font-medium text-gray-900">
                  {product.serialNumber}
                </span>
              </div>
            )}

            <div className="p-3.5 flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-500 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Vị trí lắp đặt chi tiết:
              </span>
              <span className="font-medium text-gray-900 text-right">
                {product.location || product.department || "Tại trung tâm sát hạch GPLX"}
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-500 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Cán bộ / Đơn vị quản lý:
              </span>
              <span className="font-medium text-gray-900 text-right flex items-center gap-2">
                <span>{product.manager || "Ban Quản Lý Trung Tâm"}</span>
                {product.managerPhone && (
                  <a 
                    href={`tel:${product.managerPhone}`} 
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {product.managerPhone}
                  </a>
                )}
              </span>
            </div>

            {product.specifications && (
              <div className="p-3.5 text-xs sm:text-sm space-y-1.5">
                <span className="text-gray-500 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Cấu hình & Thông số kỹ thuật:
                </span>
                <div className="p-3 bg-gray-50 rounded-xl text-gray-700 whitespace-pre-wrap leading-relaxed font-sans text-xs">
                  {product.specifications}
                </div>
              </div>
            )}
          </div>

          {/* Mã QR tra cứu nhanh */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 p-4 sm:p-5 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-200 shrink-0">
              <QRCodeSVG 
                value={scanUrl} 
                size={110} 
                level="H" 
                fgColor="#0f172a" 
              />
            </div>
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-gray-900 flex items-center justify-center sm:justify-start gap-1.5">
                <span>MÃ QR TRA CỨU DI ĐỘNG</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Quét mã này bằng camera điện thoại hoặc Zalo để mở hồ sơ số của thiết bị này từ xa.
              </p>
              <a
                href={`/scan/${encodeURIComponent(product.code)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline pt-1"
              >
                Mở trang tra cứu công khai
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
}
