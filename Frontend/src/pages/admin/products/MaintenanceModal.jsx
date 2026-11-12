import { useState } from "react";
import { Wrench, CheckCircle2, AlertCircle, X, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import productService from "../../../services/productService";

export default function MaintenanceModal({ product, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState("start"); // "start" (gửi đi sửa) | "finish" (hoàn tất)
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!product) return null;

  const activeCount = product.quantityActive !== undefined ? product.quantityActive : product.quantity;
  const maintenanceCount = product.quantityMaintenance || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (quantity <= 0) {
      toast.warning("Số lượng thiết bị phải lớn hơn 0!");
      return;
    }

    if (activeTab === "start" && quantity > activeCount) {
      toast.error(`Chỉ có ${activeCount} thiết bị đang hoạt động để gửi đi bảo trì!`);
      return;
    }

    if (activeTab === "finish" && quantity > maintenanceCount) {
      toast.error(`Chỉ có ${maintenanceCount} thiết bị đang trong trạng thái bảo trì!`);
      return;
    }

    try {
      setSubmitting(true);
      const res = await productService.maintenanceAction(product._id, {
        action: activeTab,
        quantity: Number(quantity),
        reason: reason.trim(),
      });

      toast.success(res.message || "Cập nhật trạng thái bảo trì thành công!");
      if (onSuccess) onSuccess(res.product);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi xử lý bảo trì!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              Quản Lý Bảo Trì & Sửa Chữa Thiết Bị
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              [{product.code}] {product.name} — <strong className="text-blue-400">{product.department}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thống kê số lượng hiện tại */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Tổng số lượng</span>
            <span className="text-base font-bold text-white">{product.quantity || 1}</span>
          </div>
          <div className="p-2.5 bg-emerald-950/30 rounded-xl border border-emerald-900/40">
            <span className="text-[11px] text-emerald-400 block">🟢 Đang hoạt động</span>
            <span className="text-base font-bold text-emerald-300">{activeCount}</span>
          </div>
          <div className="p-2.5 bg-amber-950/30 rounded-xl border border-amber-900/40">
            <span className="text-[11px] text-amber-400 block">🟡 Đang bảo trì</span>
            <span className="text-base font-bold text-amber-300">{maintenanceCount}</span>
          </div>
        </div>

        {/* Nội dung thao tác */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Tabs chọn hành động */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setActiveTab("start");
                setQuantity(1);
                setReason("");
              }}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "start"
                  ? "bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Đưa máy đi bảo trì ({activeCount} khả dụng)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("finish");
                setQuantity(Math.min(1, maintenanceCount));
                setReason("");
              }}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "finish"
                  ? "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Hoàn tất sửa chữa ({maintenanceCount} đang sửa)
            </button>
          </div>

          {/* Form nhập liệu */}
          {activeTab === "start" ? (
            <div className="space-y-3 p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl">
              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1">
                  Số lượng máy gửi đi sửa chữa / bảo dưỡng:
                </label>
                <input
                  type="number"
                  min="1"
                  max={activeCount}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 bg-slate-900 border border-amber-700/60 rounded-lg text-white font-bold text-sm focus:ring-2 focus:ring-amber-500 shadow-xs"
                />
                <p className="text-[10px] text-amber-400/80 mt-1">
                  Hệ thống sẽ chuyển {quantity} máy từ [Hoạt động] sang [Bảo trì].
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lý do hỏng hóc / Nội dung cần bảo dưỡng:
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ví dụ: Máy số 03 liệt phím, máy số 08 chai pin gửi bảo hành..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-amber-500 shadow-xs"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl">
              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">
                  Số lượng máy đã sửa xong, đưa về sử dụng:
                </label>
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, maintenanceCount)}
                  disabled={maintenanceCount === 0}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 bg-slate-900 border border-emerald-700/60 rounded-lg text-white font-bold text-sm focus:ring-2 focus:ring-emerald-500 shadow-xs disabled:opacity-50"
                />
                <p className="text-[10px] text-emerald-400/80 mt-1">
                  {maintenanceCount > 0 
                    ? `Hệ thống sẽ chuyển ${quantity} máy từ [Bảo trì] trở lại [Hoạt động tốt].`
                    : "Hiện không có thiết bị nào đang trong diện bảo trì!"}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ghi chú nghiệm thu sau sửa chữa:
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Đã thay bàn phím mới, kiểm tra hoạt động ổn định..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>
            </div>
          )}

          {/* Lịch sử bảo trì gần đây nếu có */}
          {product.history && product.history.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                Nhật ký biến động gần nhất:
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {product.history.slice(0, 5).map((h, i) => (
                  <div key={i} className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-[11px] flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-200">{h.title}</p>
                      {h.reason && <p className="text-slate-400 text-[10px] italic">"{h.reason}"</p>}
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {h.createdAt ? new Date(h.createdAt).toLocaleDateString("vi-VN") : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nút Submit */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={submitting || (activeTab === "start" && activeCount === 0) || (activeTab === "finish" && maintenanceCount === 0)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 ${
                activeTab === "start" ? "bg-amber-600 hover:bg-amber-500" : "bg-emerald-600 hover:bg-emerald-500"
              }`}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {activeTab === "start" ? "Xác nhận gửi bảo trì" : "Xác nhận hoàn tất sửa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
