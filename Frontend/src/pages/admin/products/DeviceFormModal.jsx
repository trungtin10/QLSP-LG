import { useState, useEffect } from "react";
import { Package, X, Loader2 } from "lucide-react";
import CreatableSelect from "./CreatableSelect";

const initialFormState = {
  code: "",
  name: "",
  category: "Laptop (Máy tính xách tay)",
  department: "Phòng Thi Lý Thuyết",
  assignedVehicle: "",
  serialNumber: "",
  status: "Hoạt động",
  quantity: 1,
  warrantyExpiry: "",
  purchaseDate: "",
  specifications: "",
  note: "",
  maintenanceReason: "",
  manager: "Ban Quản Lý",
  managerPhone: "",
  location: "",
};

export default function DeviceFormModal({
  isOpen,
  onClose,
  editingProduct,
  onSubmit,
  submitting,
  departmentNames = [],
  categoryNames = [],
  defaultDept = "Phòng Thi Lý Thuyết",
  defaultCategory = "Laptop (Máy tính xách tay)",
}) {
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        code: editingProduct.code || "",
        name: editingProduct.name || "",
        category: editingProduct.category || defaultCategory,
        department: editingProduct.department || defaultDept,
        assignedVehicle: editingProduct.assignedVehicle || "",
        serialNumber: editingProduct.serialNumber || "",
        status: editingProduct.status || "Hoạt động",
        quantity: editingProduct.quantity || 1,
        warrantyExpiry: editingProduct.warrantyExpiry ? editingProduct.warrantyExpiry.substring(0, 10) : "",
        purchaseDate: editingProduct.purchaseDate ? editingProduct.purchaseDate.substring(0, 10) : "",
        specifications: editingProduct.specifications || "",
        note: editingProduct.note || "",
        maintenanceReason: editingProduct.maintenanceReason || "",
        manager: editingProduct.manager || "Ban Quản Lý",
        managerPhone: editingProduct.managerPhone || "",
        location: editingProduct.location || "",
      });
    } else {
      setFormData({
        ...initialFormState,
        department: defaultDept || "Phòng Thi Lý Thuyết",
        category: defaultCategory || "Laptop (Máy tính xách tay)",
      });
    }
  }, [editingProduct, isOpen, defaultDept, defaultCategory]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            {editingProduct ? `Cập nhật thiết bị: ${editingProduct.code}` : "Thêm thiết bị mới"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Dòng 1: Mã & Tên */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mã thiết bị <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: LT-01, DAT-B2-05..."
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono uppercase text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tên thiết bị <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Laptop Dell Vostro 3520..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
              />
            </div>
          </div>

          {/* Dòng 2: Loại thiết bị & Phòng ban */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CreatableSelect
              label="Loại thiết bị"
              required
              placeholder="Chọn hoặc gõ loại thiết bị..."
              options={categoryNames}
              value={formData.category}
              onChange={(val) => setFormData({ ...formData, category: val })}
            />

            <CreatableSelect
              label="Phòng ban / Vị trí"
              required
              placeholder="Chọn hoặc gõ vị trí phòng ban..."
              options={departmentNames}
              value={formData.department}
              onChange={(val) => setFormData({ ...formData, department: val })}
            />
          </div>

          {/* Dòng 3: Biển số xe & Serial/IMEI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Biển số xe / Số xe (nếu là thiết bị DAT/Xe thi)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Xe 05 - 29A-123.45"
                value={formData.assignedVehicle}
                onChange={(e) => setFormData({ ...formData, assignedVehicle: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Số Serial / IMEI thiết bị
              </label>
              <input
                type="text"
                placeholder="Số serial hoặc IMEI SIM 4G"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
              />
            </div>
          </div>

          {/* Dòng 4: Trạng thái & Số lượng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Trạng thái hoạt động <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 shadow-xs"
              >
                <option value="Hoạt động">🟢 Hoạt động</option>
                <option value="Đang bảo trì">🟡 Đang bảo trì / Sửa chữa</option>
                <option value="Hỏng">🔴 Hỏng / Cần thay thế</option>
                <option value="Dự phòng">🔵 Dự phòng trong kho</option>
                <option value="Thanh lý">⚪ Đã thanh lý</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Số lượng thiết bị <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                placeholder="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
            </div>
          </div>

          {/* Dòng 5: Người quản lý & Số điện thoại (SĐT) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Người quản lý / Phụ trách thiết bị
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Nguyễn Văn A, Thầy Tuấn..."
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Số điện thoại liên hệ (SĐT)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: 0987654321..."
                value={formData.managerPhone}
                onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
              />
            </div>
          </div>

          {formData.status === "Đang bảo trì" && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <label className="block text-xs font-semibold text-amber-900">
                Nội dung / Nguyên nhân bảo dưỡng hoặc sửa chữa:
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Thay pin laptop, kiểm tra anten GPS thiết bị DAT..."
                value={formData.maintenanceReason}
                onChange={(e) => setFormData({ ...formData, maintenanceReason: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-amber-500 shadow-xs"
              />
            </div>
          )}

          {/* Dòng 5: Hạn bảo hành & Ngày sử dụng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Hạn bảo hành / Kiểm định định kỳ
              </label>
              <input
                type="date"
                value={formData.warrantyExpiry}
                onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ngày đưa vào sử dụng
              </label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
            </div>
          </div>

          {/* Dòng 6: Cấu hình / Thông số */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Thông số kỹ thuật / Cấu hình máy
            </label>
            <textarea
              rows={2}
              placeholder="Ví dụ: Core i5, RAM 16GB, SSD 512GB, Màn hình 15.6 inch..."
              value={formData.specifications}
              onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
          </div>

          {/* Dòng 7: Ghi chú */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Ghi chú bổ sung
            </label>
            <textarea
              rows={2}
              placeholder="Ghi chú khác nếu có..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingProduct ? "Lưu thay đổi" : "Lưu & Sinh mã QR thiết bị"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
