import { useState } from "react";
import { ArrowRightLeft, Building2, CheckCircle2, AlertCircle, X, Loader2, ArrowRight, History } from "lucide-react";
import { toast } from "sonner";
import productService from "../../../services/productService";

export default function TransferModal({ product, departmentNames = [], onClose, onSuccess }) {
  const [toDepartment, setToDepartment] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!product) return null;

  // Số lượng khả dụng để điều chuyển (bao gồm đang hoạt động + lưu kho)
  const activeCount = product.quantityActive !== undefined ? product.quantityActive : product.quantity;
  const storageCount = product.quantityStorage || 0;
  const maintenanceCount = product.quantityMaintenance || 0;
  const availableCount = activeCount + storageCount;

  // Lọc bỏ phòng ban hiện tại
  const targetDepts = departmentNames.filter((d) => d !== product.department);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!toDepartment.trim()) {
      toast.warning("Vui lòng chọn phòng ban / vị trí tiếp nhận!");
      return;
    }

    if (toDepartment.trim() === product.department) {
      toast.error("Phòng ban tiếp nhận phải khác phòng ban hiện tại!");
      return;
    }

    if (quantity <= 0) {
      toast.warning("Số lượng điều chuyển phải lớn hơn 0!");
      return;
    }

    if (quantity > availableCount) {
      toast.error(`Chỉ có thể điều chuyển tối đa ${availableCount} thiết bị khả dụng!`);
      return;
    }

    try {
      setSubmitting(true);
      const res = await productService.transferProduct(product._id, {
        toDepartment: toDepartment.trim(),
        quantity: Number(quantity),
        reason: reason.trim(),
      });

      toast.success(res.message || "Điều chuyển thiết bị thành công!");
      if (onSuccess) onSuccess(res.product);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi thực hiện điều chuyển!");
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
              <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
              Điều Chuyển & Cấp Phát Thiết Bị
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              [{product.code}] {product.name}
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
            <span className="text-[11px] text-slate-400 block">Hiện tại ở phòng</span>
            <span className="text-[11px] font-bold text-blue-400 block truncate">{product.department}</span>
            <span className="text-sm font-bold text-white mt-0.5 block">{product.quantity || 1} cái</span>
          </div>
          <div className="p-2.5 bg-emerald-950/30 rounded-xl border border-emerald-900/40">
            <span className="text-[11px] text-emerald-400 block">🟢 Khả dụng chuyển</span>
            <span className="text-base font-bold text-emerald-300 mt-1 block">{availableCount}</span>
            <span className="text-[9px] text-slate-500 block">({activeCount} hoạt động + {storageCount} kho)</span>
          </div>
          <div className="p-2.5 bg-amber-950/30 rounded-xl border border-amber-900/40">
            <span className="text-[11px] text-amber-400 block">🟡 Đang bảo trì</span>
            <span className="text-base font-bold text-amber-300 mt-1 block">{maintenanceCount}</span>
            <span className="text-[9px] text-slate-500 block">(không thể chuyển)</span>
          </div>
        </div>

        {/* Nội dung form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Chọn phòng ban tiếp nhận */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Phòng ban / Vị trí tiếp nhận *</span>
              <span className="text-[10px] text-cyan-400 font-normal">Nơi chuyển đến</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={toDepartment}
                onChange={(e) => setToDepartment(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                required
              >
                <option value="">-- Chọn phòng ban / vị trí tiếp nhận --</option>
                {targetDepts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Số lượng cần chuyển */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-semibold text-slate-300">
                Số lượng điều chuyển (cái / bộ) *
              </label>
              <span className="text-[11px] text-slate-400">
                Tối đa: <strong className="text-emerald-400">{availableCount}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={availableCount}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-sm font-bold text-center focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                required
              />
              <button
                type="button"
                onClick={() => setQuantity(availableCount)}
                className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-xs transition cursor-pointer"
              >
                Tất cả ({availableCount})
              </button>
            </div>
          </div>

          {/* Lý do / Ghi chú điều chuyển */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Lý do điều chuyển / Ghi chú bàn giao
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Cấp phát cho phòng thi lý thuyết, Xuất kho dự phòng phục vụ kỳ thi..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-hidden resize-none"
            />
          </div>

          {/* Preview luồng luân chuyển */}
          <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-xl flex items-center justify-between text-xs text-slate-300">
            <div className="text-center flex-1">
              <span className="text-[10px] text-slate-400 block">Nơi xuất</span>
              <strong className="text-blue-400 block truncate">{product.department}</strong>
              <span className="text-[11px] text-slate-300 font-mono">-{quantity} cái</span>
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0 mx-2" />
            <div className="text-center flex-1">
              <span className="text-[10px] text-slate-400 block">Nơi nhận</span>
              <strong className="text-emerald-400 block truncate">{toDepartment || "(Chưa chọn)"}</strong>
              <span className="text-[11px] text-slate-300 font-mono">+{quantity} cái</span>
            </div>
          </div>

          {/* Lịch sử hoạt động gần đây */}
          {product.history && product.history.length > 0 && (
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-2">
                <History className="w-3.5 h-3.5 text-slate-400" />
                Lịch sử luân chuyển / bảo trì gần đây
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {product.history.slice(0, 4).map((h, idx) => (
                  <div key={idx} className="p-2 bg-slate-950/60 rounded-lg border border-slate-800/70 text-[10px] text-slate-300 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-200">{h.title}</p>
                      <p className="text-slate-400 mt-0.5">{h.reason}</p>
                    </div>
                    <span className="text-slate-500 shrink-0 text-[9px]">
                      {new Date(h.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nút hành động */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition text-xs font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || availableCount <= 0}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-cyan-600/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Xác nhận điều chuyển
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
