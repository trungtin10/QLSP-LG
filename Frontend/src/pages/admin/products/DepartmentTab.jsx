import { useState, useMemo } from "react";
import { 
  Building2, 
  Plus, 
  Search, 
  Loader2, 
  Laptop, 
  Eye, 
  Edit3, 
  Trash2, 
  X 
} from "lucide-react";
import { toast } from "sonner";
import productService from "../../../services/productService";

export default function DepartmentTab({
  departments = [],
  deptLoading = false,
  products = [],
  onRefresh,
  onFilterByDept,
}) {
  const [deptSearch, setDeptSearch] = useState("");
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptFormData, setDeptFormData] = useState({
    name: "",
    code: "",
    area: "Tầng 2 - Nhà Điều Hành",
    description: "",
  });
  const [deptSubmitting, setDeptSubmitting] = useState(false);

  const filteredDepartments = useMemo(() => {
    if (!deptSearch.trim()) return departments;
    const term = deptSearch.toLowerCase().trim();
    return departments.filter(
      (d) =>
        (d.name && d.name.toLowerCase().includes(term)) ||
        (d.code && d.code.toLowerCase().includes(term))
    );
  }, [departments, deptSearch]);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setIsDeptModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setDeptFormData({
      name: dept.name || "",
      code: dept.code || "",
      area: dept.area || "",
      description: dept.description || "",
    });
    setIsDeptModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deptFormData.name.trim()) {
      toast.warning("Vui lòng nhập tên phòng ban / vị trí!");
      return;
    }

    try {
      setDeptSubmitting(true);
      if (editingDept && editingDept._id) {
        await productService.updateDepartment(editingDept._id, deptFormData);
        toast.success(`Cập nhật phòng ban [${deptFormData.name}] thành công!`);
      } else {
        await productService.createDepartment(deptFormData);
        toast.success(`Thêm mới phòng ban [${deptFormData.name}] thành công!`);
      }
      setIsDeptModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu phòng ban!");
    } finally {
      setDeptSubmitting(false);
    }
  };

  const handleDelete = async (dept) => {
    if (!dept._id) {
      toast.info(`Không thể xoá dữ liệu mặc định hệ thống!`);
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xoá phòng ban [${dept.name}]?`)) return;

    try {
      await productService.deleteDepartment(dept._id);
      toast.success(`Đã xoá phòng ban [${dept.name}] thành công!`);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi xoá phòng ban!");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            Quản Lý Phòng Ban & Vị Trí
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Thêm Phòng Ban / Vị Trí
        </button>
      </div>

      {/* Tìm Kiếm */}
      <div className="relative bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800">
        <Search className="w-4 h-4 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Tìm theo tên phòng ban, mã ký hiệu, mô tả..."
          value={deptSearch}
          onChange={(e) => setDeptSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Bảng Danh Sách */}
      <div className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {deptLoading ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin text-blue-500 mx-auto mb-2" />
            <p className="text-xs">Đang tải danh sách phòng ban...</p>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">Không tìm thấy phòng ban nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4">Tên Phòng Ban / Vị Trí</th>
                  <th className="py-3 px-4">Mã / Ký Hiệu</th>
                  <th className="py-3 px-4 text-center">Số Lượng Thiết Bị</th>
                  <th className="py-3 px-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredDepartments.map((item, index) => {
                  const count = item.deviceCount !== undefined && item.deviceCount > 0
                    ? item.deviceCount
                    : products
                        .filter((p) => (p.department || "").toLowerCase().trim() === item.name.toLowerCase().trim())
                        .reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);

                  return (
                    <tr key={item._id || item.code || index} className="hover:bg-slate-900/60 transition">
                      <td className="py-3.5 px-4 text-center text-slate-500 font-medium">
                        {index + 1}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-950/70 border border-blue-800/50 flex items-center justify-center text-blue-400 shrink-0">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <span>{item.name}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-400">
                        {item.code || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onFilterByDept(item.name)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-950/70 hover:bg-blue-900/80 text-blue-300 border border-blue-800/60 rounded-full text-xs font-bold transition cursor-pointer"
                          title="Bấm để xem danh sách thiết bị thuộc phòng này"
                        >
                          <Laptop className="w-3.5 h-3.5" />
                          {count} thiết bị
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onFilterByDept(item.name)}
                            className="p-1.5 text-blue-400 hover:bg-blue-950/60 rounded-lg transition cursor-pointer"
                            title="Xem thiết bị"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                            title="Sửa thông tin phòng ban"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 text-rose-400 hover:bg-rose-950/60 rounded-lg transition cursor-pointer"
                            title="Xoá phòng ban"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Thêm/Sửa Phòng Ban */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                {editingDept ? `Sửa Phòng Ban: ${editingDept.name}` : "Thêm Phòng Ban / Vị Trí Mới"}
              </h3>
              <button
                onClick={() => setIsDeptModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tên phòng ban / Vị trí <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Phòng Thi Lý Thuyết, Sân Sát Hạch..."
                  value={deptFormData.name}
                  onChange={(e) => setDeptFormData({ ...deptFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mã / Ký hiệu
                </label>
                <input
                  type="text"
                  placeholder="VD: P_LYTHUYET"
                  value={deptFormData.code}
                  onChange={(e) => setDeptFormData({ ...deptFormData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono uppercase text-xs focus:ring-2 focus:ring-blue-500 shadow-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={deptSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {deptSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingDept ? "Lưu thay đổi" : "Tạo phòng ban"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
