import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import productService from "../services/productService";
import { 
  ShieldCheck, 
  Building2, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Cpu, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  ArrowLeft,
  Car,
  History,
  Wrench,
  ArrowRightLeft
} from "lucide-react";

const STATUS_CONFIG = {
  "active": { label: "Đang hoạt động tốt", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: CheckCircle2 },
  "Hoạt động": { label: "Đang hoạt động tốt", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: CheckCircle2 },
  "maintenance": { label: "Đang bảo trì định kỳ", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: AlertCircle },
  "Đang bảo trì": { label: "Đang bảo trì định kỳ", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: AlertCircle },
  "broken": { label: "Đang báo hỏng", color: "bg-rose-500/20 text-rose-400 border-rose-500/30", icon: AlertCircle },
  "Hỏng": { label: "Đang báo hỏng", color: "bg-rose-500/20 text-rose-400 border-rose-500/30", icon: AlertCircle },
  "storage": { label: "Đang lưu kho / Dự phòng", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: CheckCircle2 },
  "Dự phòng": { label: "Đang lưu kho / Dự phòng", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: CheckCircle2 },
  "Thanh lý": { label: "Đã thanh lý", color: "bg-slate-500/20 text-slate-400 border-slate-500/30", icon: CheckCircle2 },
  "liquidation": { label: "Đã thanh lý", color: "bg-slate-500/20 text-slate-400 border-slate-500/30", icon: CheckCircle2 },
};

export default function ScanAssetPage() {
  const { code } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        setLoading(true);
        const res = await productService.getProductByCode(code);
        setProduct(res.product);
      } catch (err) {
        setError(err.response?.data?.message || "Không tìm thấy thông tin thiết bị này!");
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchAsset();
    }
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-300 p-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3" />
        <p className="text-sm">Đang tải thông tin thiết bị...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-100 p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/80 text-rose-400 flex items-center justify-center mb-4 border border-rose-800">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Không tìm thấy dữ liệu</h1>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          {error || `Mã thiết bị [${code}] chưa được đăng ký trong cơ sở dữ liệu GPLX.`}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Về Trang Chủ
        </Link>
      </div>
    );
  }

  const statusInfo = STATUS_CONFIG[product.status] || STATUS_CONFIG.active;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 flex flex-col items-center">
      <div className="w-full max-w-md space-y-5">
        {/* Top Header Card */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 text-blue-400 border border-blue-800 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            HỆ THỐNG QUẢN LÝ THIẾT BỊ GPLX
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            {product.name}
          </h1>
          <p className="font-mono text-sm font-bold text-blue-400 tracking-wider">
            MÃ ĐỊNH DANH: {product.code}
          </p>
        </div>

        {/* Thông tin chi tiết */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4">
          {/* Tình trạng hoạt động */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <span className="text-xs text-slate-400">Trạng thái thiết bị:</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {statusInfo.label}
            </span>
          </div>

          {/* Phòng ban quản lý */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Thuộc phòng ban</p>
              <p className="text-sm font-bold text-white">{product.department}</p>
            </div>
          </div>

          {/* Người quản lý */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-slate-400">Người chịu trách nhiệm</p>
              <p className="text-sm font-bold text-white">{product.manager || "Ban Quản Lý"}</p>
            </div>
          </div>

          {/* Biển số xe gắn thiết bị */}
          {product.assignedVehicle && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Biển số xe / Phương tiện thi</p>
                <p className="text-sm font-bold text-amber-300 font-mono">{product.assignedVehicle}</p>
              </div>
            </div>
          )}

          {/* Vị trí đặt */}
          {product.location && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Vị trí lắp đặt</p>
                <p className="text-xs font-semibold text-slate-200">{product.location}</p>
              </div>
            </div>
          )}

          {/* Phân loại, Số lượng, Serial, Ngày bàn giao, SDT */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Phân loại:</span>
              <span className="font-semibold text-white">{product.category || "Thiết bị"}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Số lượng:</span>
              <p className="font-bold text-blue-400">{product.quantity || 1} cái/bộ</p>
              {product.quantityMaintenance > 0 && (
                <p className="text-amber-400 font-medium text-[11px] mt-0.5">
                  🟡 Đang bảo trì: <strong className="text-white">{product.quantityMaintenance}</strong>
                </p>
              )}
            </div>

            {product.serialNumber && (
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">Số Serial / IMEI:</span>
                <span className="font-mono text-slate-200">{product.serialNumber}</span>
              </div>
            )}

            <div>
              <span className="text-slate-400 block text-[11px]">Ngày bàn giao:</span>
              <span className="font-semibold text-white">
                {product.purchaseDate ? new Date(product.purchaseDate).toLocaleDateString("vi-VN") : "Chưa rõ"}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Số điện thoại liên hệ:</span>
              {product.managerPhone ? (
                <a
                  href={`tel:${product.managerPhone}`}
                  className="inline-flex items-center gap-1 font-semibold text-blue-400 hover:underline mt-0.5"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  SDT: {product.managerPhone}
                </a>
              ) : (
                <span className="text-slate-500">—</span>
              )}
            </div>

            {product.warrantyExpiry && (
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">Hạn kiểm định / bảo hành:</span>
                <span className="font-semibold text-amber-300">
                  {new Date(product.warrantyExpiry).toLocaleDateString("vi-VN")}
                </span>
              </div>
            )}
          </div>

          {/* Lý do bảo trì nếu có */}
          {product.maintenanceReason && (
            <div className="p-3 bg-amber-950/60 rounded-xl border border-amber-800/80 text-xs text-amber-200">
              <p className="font-semibold mb-1">Nội dung bảo dưỡng / sửa chữa:</p>
              <p className="text-[11px]">{product.maintenanceReason}</p>
            </div>
          )}

          {/* Thông số kỹ thuật / ghi chú */}
          {(product.specifications || product.note) && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs space-y-2">
              {product.specifications && (
                <div>
                  <p className="text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-blue-400" />
                    Cấu hình / Thông số kỹ thuật:
                  </p>
                  <p className="text-slate-300 whitespace-pre-line text-[11px]">{product.specifications}</p>
                </div>
              )}
              {product.note && (
                <div className="pt-2 border-t border-slate-800">
                  <p className="text-slate-400 font-semibold mb-0.5">Ghi chú bổ sung:</p>
                  <p className="text-slate-400 text-[11px]">{product.note}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lịch sử hoạt động & luân chuyển */}
        {product.history && product.history.length > 0 && (
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
            <h3 className="font-bold text-xs text-white flex items-center gap-2">
              <History className="w-4 h-4 text-blue-400" />
              Lịch sử luân chuyển & bảo dưỡng ({product.history.length})
            </h3>
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {product.history.map((h, idx) => {
                const isMaintenance = h.action?.startsWith("maintenance");
                const isTransfer = h.action?.startsWith("transfer");
                return (
                  <div key={idx} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                        {isMaintenance ? (
                          <Wrench className="w-3.5 h-3.5 text-amber-400" />
                        ) : isTransfer ? (
                          <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                        )}
                        {h.title}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(h.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    {h.reason && (
                      <p className="text-[11px] text-slate-400">
                        Lý do / Nội dung: <span className="text-slate-300">{h.reason}</span>
                      </p>
                    )}
                    {h.performedBy && (
                      <p className="text-[10px] text-slate-500">
                        Người thực hiện: <span className="text-slate-400">{h.performedBy}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p>© • Hệ thống quản lý trang thiết bị số</p>
          <p>Mã QR được khởi tạo và mã hóa an toàn trên hệ thống máy chủ</p>
        </div>
      </div>
    </div>
  );
}
