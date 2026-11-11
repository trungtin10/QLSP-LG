import { useState, useMemo } from "react";
import { 
  Layers, 
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

export default function CategoryTab({
  categories = [],
  catLoading = false,
  products = [],
  onRefresh,
  onFilterByCategory,
}) {
  const [catSearch, setCatSearch] = useState("");
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catFormData, setCatFormData] = useState({ name: "", code: "", description: "" });
  const [catSubmitting, setCatSubmitting] = useState(false);

  const filteredCategories = useMemo(() => {
    if (!catSearch.trim()) return categories;
    const term = catSearch.toLowerCase().trim();
    return categories.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(term)) ||
        (c.code && c.code.toLowerCase().includes(term))
    );
  }, [categories, catSearch]);

  const handleOpenAdd = () => {
    setEditingCat(null);
    setCatFormData({ name: "", code: "", description: "" });
    setIsCatModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCat(cat);
    setCatFormData({
      name: cat.name || "",
      code: cat.code || "",
      description: cat.description || "",
    });
    setIsCatModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!catFormData.name.trim()) {
      toast.warning("Vui lòng nhập tên loại thiết bị!");
      return;
    }

    try {
      setCatSubmitting(true);
      if (editingCat && editingCat._id) {
        await productService.updateCategory(editingCat._id, catFormData);
        toast.success(`Cập nhật loại thiết bị [${catFormData.name}] thành công!`);
      } else {
        await productService.createCategory(catFormData);
        toast.success(`Thêm mới loại thiết bị [${catFormData.name}] thành công!`);
      }
      setIsCatModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu loại thiết bị!");
    } finally {
      setCatSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!cat._id) {
      toast.info(`Không thể xoá dữ liệu mặc định hệ thống!`);
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xoá loại thiết bị [${cat.name}]?`)) return;

    try {
      await productService.deleteCategory(cat._id);
      toast.success(`Đã xoá loại thiết bị [${cat.name}] thành công!`);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi xoá loại thiết bị!");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Quản Lý Loại Thiết Bị
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Thêm, sửa, xoá và theo dõi các phân loại: Laptop, PC, Thiết bị DAT, Cabin mô phỏng...
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Thêm Loại Thiết Bị
        </button>
      </div>

      {/* Tìm Kiếm */}
      <div className="relative bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800">
        <Search className="w-4 h-4 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Tìm theo tên loại thiết bị, mã ký hiệu..."
          value={catSearch}
          onChange={(e) => setCatSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Bảng Danh Sách */}
      <div className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {catLoading ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-500 mx-auto mb-2" />
            <p className="text-xs">Đang tải danh sách loại thiết bị...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Layers className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">Không tìm thấy loại thiết bị nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4">Tên Loại Thiết Bị</th>
                  <th className="py-3 px-4">Mã / Ký Hiệu</th>
                  <th className="py-3 px-4 text-center">Số Lượng Thiết Bị</th>
                  <th className="py-3 px-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredCategories.map((item, index) => {
                  const count = item.deviceCount !== undefined && item.deviceCount > 0
                    ? item.deviceCount
                    : products
                        .filter((p) => (p.category || "").toLowerCase().trim() === item.name.toLowerCase().trim())
                        .reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);

                  return (
                    <tr key={item._id || item.code || index} className="hover:bg-slate-900/60 transition">
                      <td className="py-3.5 px-4 text-center text-slate-500 font-medium">
                        {index + 1}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-950/70 border border-indigo-800/50 flex items-center justify-center text-indigo-400 shrink-0">
                          <Layers className="w-3.5 h-3.5" />
                        </div>
                        <span>{item.name}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-400">
                        {item.code || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onFilterByCategory(item.name)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-800/60 rounded-full text-xs font-bold transition cursor-pointer"
                          title="Bấm để xem danh sách thiết bị thuộc loại này"
                        >
                          <Laptop className="w-3.5 h-3.5" />
                          {count} thiết bị
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onFilterByCategory(item.name)}
                            className="p-1.5 text-indigo-400 hover:bg-indigo-950/60 rounded-lg transition cursor-pointer"
                            title="Xem thiết bị"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                            title="Sửa loại thiết bị"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 text-rose-400 hover:bg-rose-950/60 rounded-lg transition cursor-pointer"
                            title="Xoá loại thiết bị"
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

      {/* Modal Thêm/Sửa Loại Thiết Bị */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                {editingCat ? `Sửa Loại Thiết Bị: ${editingCat.name}` : "Thêm Loại Thiết Bị Mới"}
              </h3>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tên loại thiết bị <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Laptop (Máy tính xách tay), Thiết bị DAT..."
                  value={catFormData.name}
                  onChange={(e) => setCatFormData({ ...catFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mã / Ký hiệu loại
                </label>
                <input
                  type="text"
                  placeholder="VD: LAPTOP, PC, DAT..."
                  value={catFormData.code}
                  onChange={(e) => setCatFormData({ ...catFormData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono uppercase text-xs focus:ring-2 focus:ring-indigo-500 shadow-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={catSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {catSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingCat ? "Lưu thay đổi" : "Tạo loại thiết bị"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
