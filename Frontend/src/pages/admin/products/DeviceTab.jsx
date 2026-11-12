import { useState, useEffect } from "react";
import { 
  Package, 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Loader2, 
  Car, 
  Building2, 
  QrCode, 
  Edit3, 
  Trash2,
  Wrench,
  ArrowRightLeft,
  MoreVertical 
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { STATUS_CONFIG } from "./constants";
import productService from "../../../services/productService";

export default function DeviceTab({
  products = [],
  loading = false,
  search = "",
  setSearch,
  selectedDept = "all",
  setSelectedDept,
  selectedCategory = "all",
  setSelectedCategory,
  selectedStatus = "all",
  setSelectedStatus,
  departmentNames = [],
  categoryNames = [],
  onOpenAdd,
  onOpenEdit,
  onDelete,
  onOpenQrModal,
  onOpenMaintenance,
  onOpenTransfer,
  onRefresh,
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [openActionId, setOpenActionId] = useState(null);

  // Đóng dropdown thao tác khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".action-menu-dropdown")) {
        setOpenActionId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Chọn tất cả / Bỏ chọn
  const isAllSelected = products.length > 0 && selectedIds.length === products.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < products.length;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(products.map((p) => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // ================= XUẤT EXCEL =================
  const handleExportExcel = () => {
    const listToExport = selectedIds.length > 0
      ? products.filter((p) => selectedIds.includes(p._id))
      : products;

    if (listToExport.length === 0) {
      toast.warning("Không có dữ liệu thiết bị nào để xuất Excel!");
      return;
    }

    try {
      const dataToExport = listToExport.map((d, index) => {
        const statusObj = STATUS_CONFIG[d.status] || { label: d.status || "Hoạt động" };
        return {
          "STT": index + 1,
          "Mã Thiết Bị": d.code,
          "Tên Thiết Bị": d.name,
          "Số Lượng": d.quantity || 1,
          "Loại Thiết Bị": d.category || "—",
          "Phòng Ban / Vị Trí": d.department || "—",
          "Biển Số Xe (Nếu có)": d.assignedVehicle || "—",
          "Số Serial / IMEI": d.serialNumber || "—",
          "Trạng Thái": statusObj.label,
          "Cấu Hình / Thông Số": d.specifications || "—",
          "Hạn Bảo Hành / Kiểm Định": d.warrantyExpiry ? new Date(d.warrantyExpiry).toLocaleDateString("vi-VN") : "—",
          "Ngày Đưa Vào Sử Dụng": d.purchaseDate ? new Date(d.purchaseDate).toLocaleDateString("vi-VN") : "—",
          "Lý Do Bảo Trì / Sửa Chữa": d.maintenanceReason || "—",
          "Ghi Chú": d.note || "—",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      worksheet["!cols"] = [
        { wch: 6 },
        { wch: 16 },
        { wch: 32 },
        { wch: 10 },
        { wch: 25 },
        { wch: 25 },
        { wch: 20 },
        { wch: 22 },
        { wch: 16 },
        { wch: 35 },
        { wch: 20 },
        { wch: 20 },
        { wch: 28 },
        { wch: 25 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "ThietBi_GPLX");

      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
      const fileName = `Danh_Sach_Thiet_Bi_GPLX_${dateStr}.xlsx`;

      XLSX.writeFile(workbook, fileName);
      toast.success(`Đã xuất thành công ${listToExport.length} thiết bị ra file [${fileName}]!`);
    } catch (err) {
      console.error("Lỗi xuất Excel:", err);
      toast.error("Lỗi khi xuất file Excel!");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Package className="w-5 h-5 text-blue-500" />
            Danh Sách Trang Thiết Bị
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Quản lý thiết bị lý thuyết, thực hành, cabin mô phỏng & xe sát hạch DAT
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* NÚT XUẤT EXCEL CHUẨN XANH LÁ THEO ẢNH YÊU CẦU */}
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition cursor-pointer shrink-0"
            title="Bấm để tải về file Excel danh sách các thiết bị"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Xuất Excel {selectedIds.length > 0 && `(${selectedIds.length})`}
          </button>

          {/* Nút Thêm Thiết Bị Mới */}
          <button
            onClick={onOpenAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Thêm thiết bị mới
          </button>
        </div>
      </div>

      {/* Thanh Tìm Kiếm & Các Bộ Lọc */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm mã thiết bị, tên máy, biển số xe, số serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">🏢 Tất cả phòng ban / vị trí</option>
            {departmentNames.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">📦 Tất cả loại</option>
            {categoryNames.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">⚡ Tất cả trạng thái</option>
            <option value="Hoạt động">🟢 Hoạt động</option>
            <option value="Đang bảo trì">🟡 Đang bảo trì</option>
            <option value="Hỏng">🔴 Hỏng hóc</option>
            <option value="Dự phòng">🔵 Dự phòng</option>
            <option value="Thanh lý">⚪ Thanh lý</option>
          </select>
        </div>
      </div>

      {/* Bảng Danh Sách Thiết Bị */}
      <div className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
            <p className="text-xs">Đang tải danh sách thiết bị...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">Không có thiết bị nào phù hợp</p>
            <p className="text-xs text-slate-500 mt-1">Bấm "Thêm thiết bị mới" để bắt đầu nhập dữ liệu.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected;
                      }}
                      onChange={handleSelectAll}
                      className="w-3.5 h-3.5 rounded border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3 w-12 text-center">STT</th>
                  <th className="py-3 px-3">Mã ID</th>
                  <th className="py-3 px-3">Tên Thiết Bị / Thông Tin</th>
                  <th className="py-3 px-3">Phòng Ban / Vị Trí</th>
                  <th className="py-3 px-3 text-center">Số Lượng</th>
                  <th className="py-3 px-3">Trạng Thái</th>
                  <th className="py-3 px-3 text-center">Mã QR</th>
                  <th className="py-3 px-3 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {products.map((p, index) => {
                  const statusInfo = STATUS_CONFIG[p.status] || STATUS_CONFIG["Hoạt động"];
                  const isSelected = selectedIds.includes(p._id);

                  return (
                    <tr
                      key={p._id}
                      className={`hover:bg-slate-900/60 transition group ${
                        isSelected ? "bg-blue-950/20" : ""
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(p._id)}
                          className="w-3.5 h-3.5 rounded border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3 text-center text-slate-500 font-medium">
                        {index + 1}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-400">
                        {p.code}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-white text-xs">{p.name}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                          <span className="text-slate-400">{p.category}</span>
                          {p.assignedVehicle && (
                            <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded-md border border-amber-800/60 font-mono text-[10px]">
                              <Car className="w-2.5 h-2.5" />
                              {p.assignedVehicle}
                            </span>
                          )}
                          {p.serialNumber && (
                            <span className="text-slate-500 font-mono text-[10px]">
                              S/N: {p.serialNumber}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-900 text-slate-200 border border-slate-800">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {p.department}
                        </span>
                        {(p.manager || p.managerPhone) && (
                          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 truncate max-w-[180px]">
                            <span className="text-slate-300 font-medium truncate">{p.manager || "Ban Quản Lý"}</span>
                            {p.managerPhone && <span className="text-emerald-400 font-mono shrink-0">({p.managerPhone})</span>}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-white text-xs block">
                          {p.quantity || 1}
                        </span>
                        {p.quantityMaintenance > 0 && (
                          <span className="inline-block mt-0.5 text-[10px] text-amber-400 font-medium">
                            🟡 {p.quantityMaintenance} bảo trì
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusInfo.color}`}>
                          <span>{statusInfo.dot}</span>
                          {statusInfo.label}
                        </span>
                        {p.status === "Đang bảo trì" && p.maintenanceReason && (
                          <p className="text-[10px] text-amber-400/90 mt-0.5 truncate max-w-xs">
                            {p.maintenanceReason}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onOpenQrModal(p)}
                          title="Bấm để xem và in mã QR chuẩn theo domain"
                          className="inline-block p-1 bg-white rounded-md shadow-xs hover:scale-110 transition cursor-pointer"
                        >
                          <QRCodeSVG 
                            value={`${window.location.origin}/scan/${encodeURIComponent(p.code)}`} 
                            size={28} 
                            level="M" 
                          />
                        </button>
                      </td>
                      <td className="py-3 px-3 text-center relative action-menu-dropdown">
                        <div className="inline-block">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionId(openActionId === p._id ? null : p._id);
                            }}
                            title="Tùy chọn thao tác"
                            className={`p-1.5 rounded-lg border transition cursor-pointer inline-flex items-center justify-center ${
                              openActionId === p._id
                                ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30"
                                : "text-slate-300 bg-slate-900 border-slate-700/80 hover:bg-slate-800 hover:text-white"
                            }`}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Dropdown Menu */}
                          {openActionId === p._id && (
                            <div
                              className={`absolute right-3 z-50 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 text-left animate-in fade-in zoom-in-95 duration-100 ${
                                index >= products.length - 2 && products.length > 2
                                  ? "bottom-full mb-1"
                                  : "top-full mt-1"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionId(null);
                                  if (onOpenMaintenance) onOpenMaintenance(p);
                                }}
                                className="w-full px-3 py-2 text-xs text-amber-300 hover:bg-amber-950/40 hover:text-amber-200 flex items-center gap-2.5 transition cursor-pointer"
                              >
                                <Wrench className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>Bảo trì & Sửa chữa</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionId(null);
                                  if (onOpenTransfer) onOpenTransfer(p);
                                }}
                                className="w-full px-3 py-2 text-xs text-cyan-300 hover:bg-cyan-950/40 hover:text-cyan-200 flex items-center gap-2.5 transition cursor-pointer"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                <span>Điều chuyển phòng ban</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionId(null);
                                  onOpenQrModal(p);
                                }}
                                className="w-full px-3 py-2 text-xs text-blue-300 hover:bg-blue-950/40 hover:text-blue-200 flex items-center gap-2.5 transition cursor-pointer"
                              >
                                <QrCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                <span>Xem & In tem mã QR</span>
                              </button>

                              <div className="my-1 border-t border-slate-800" />

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionId(null);
                                  onOpenEdit(p);
                                }}
                                className="w-full px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 transition cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>Chỉnh sửa thông tin</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionId(null);
                                  onDelete(p._id, p.name, p.code);
                                }}
                                className="w-full px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 flex items-center gap-2.5 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                <span>Xóa thiết bị</span>
                              </button>
                            </div>
                          )}
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
    </div>
  );
}
