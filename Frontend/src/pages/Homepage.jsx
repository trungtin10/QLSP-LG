import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Search, 
  Package, 
  Building2, 
  Car, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  LayoutGrid, 
  List, 
  QrCode, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Check,
  Sparkles,
  RefreshCw,
  Scan
} from "lucide-react";
import productService from "../services/productService";
import AjaxSearchBar from "../components/search/AjaxSearchBar";
import AjaxSearchDetailModal from "../components/search/AjaxSearchDetailModal";

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "Hoạt động", label: "Đang hoạt động", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { value: "Đang bảo trì", label: "Đang bảo trì", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { value: "Dự phòng", label: "Dự phòng / Lưu kho", color: "text-blue-600 bg-blue-50 border-blue-200" },
  { value: "Hỏng", label: "Báo hỏng / Cần xử lý", color: "text-rose-600 bg-rose-50 border-rose-200" },
];

const DEFAULT_DEPARTMENTS = [
  "Phòng Thi Lý Thuyết",
  "Phòng Thi Mô Phỏng",
  "Phòng Máy Chủ & Giám Sát",
  "Sân Sát Hạch Sa Hình",
  "Đội Xe Tập Lái Thực Hành",
  "Phòng tuyển sinh",
  "Đào tạo",
  "Kế toán",
  "Đội xe",
];

export default function HomePage({ onOpenScanner }) {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  // Trạng thái tìm kiếm & lọc bằng Ajax
  const [search, setSearch] = useState(initialQuery);
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Lắng nghe khi URL search params thay đổi
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null && q !== search) {
      setSearch(q);
      setPage(1);
    }
  }, [searchParams]);

  // Dữ liệu danh sách & phân trang
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(12);

  // Trạng thái UI
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, maintenance: 0, depts: 0 });

  // AbortController cho Ajax request tìm kiếm
  const abortControllerRef = useRef(null);
  const resultsRef = useRef(null);

  // 1. Tải danh mục phòng ban & thể loại khi trang khởi tạo
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [deptRes, catRes] = await Promise.allSettled([
          productService.getDepartments(),
          productService.getCategories(),
        ]);

        if (deptRes.status === "fulfilled" && deptRes.value?.departments) {
          setDepartments(deptRes.value.departments.map(d => d.name || d));
        }
        if (catRes.status === "fulfilled" && catRes.value?.categories) {
          setCategories(catRes.value.categories.map(c => c.name || c));
        }
      } catch (e) {
        console.warn("Dùng danh mục mặc định", e);
      }
    };
    fetchMetadata();
  }, []);

  // 2. Thực hiện tìm kiếm bằng AJAX mỗi khi search, bộ lọc hoặc trang thay đổi
  useEffect(() => {
    // Hủy request Ajax trước đó nếu người dùng đang thao tác nhanh
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const fetchAjaxProducts = async () => {
      setLoading(true);
      try {
        const res = await productService.searchPublic(
          {
            search: search.trim(),
            department: selectedDept !== "all" ? selectedDept : undefined,
            status: selectedStatus !== "all" ? selectedStatus : undefined,
            category: selectedCategory !== "all" ? selectedCategory : undefined,
            page,
            limit,
          },
          { signal: abortControllerRef.current.signal }
        );

        if (res && res.products) {
          setProducts(res.products);
          setTotalProducts(res.total || res.products.length);
          setTotalPages(res.totalPages || Math.ceil((res.total || res.products.length) / limit) || 1);

          // Cập nhật thống kê sơ bộ nếu ở trang 1 và không có filter
          if (page === 1 && !search && selectedDept === "all" && selectedStatus === "all") {
            const activeCount = res.products.filter(p => p.status === "Hoạt động" || p.status === "active").length;
            const maintCount = res.products.filter(p => p.status === "Đang bảo trì" || p.status === "maintenance").length;
            setStats({
              total: res.total || res.products.length,
              active: activeCount,
              maintenance: maintCount,
              depts: departments.length,
            });
          }
        }
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error("Lỗi khi gửi yêu cầu AJAX tìm kiếm:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    // Debounce ngắn để tránh giật lag khi gõ
    const timer = setTimeout(() => {
      fetchAjaxProducts();
    }, 250);

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [search, selectedDept, selectedStatus, selectedCategory, page, limit, departments.length]);

  // Reset trang về 1 khi từ khóa hoặc bộ lọc đổi
  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleDeptSelect = (dept) => {
    setSelectedDept(dept);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedDept("all");
    setSelectedStatus("all");
    setSelectedCategory("all");
    setPage(1);
  };

  const isFilterActive = search || selectedDept !== "all" || selectedStatus !== "all" || selectedCategory !== "all";

  // Chuyển trang qua Ajax và cuộn nhẹ lên bảng kết quả
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-slate-50 via-gray-50 to-blue-50/20 text-gray-900 pb-16">
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Họa tiết trang trí nền */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
          {/* Badge nhận diện */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-xs font-semibold shadow-inner">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>HỆ THỐNG QUẢN LÝ THIẾT BỊ GPLX </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Tra Cứu Thiết Bị & Phương Tiện Sát Hạch
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 max-w-2xl mx-auto leading-relaxed">
            Tìm kiếm trực tuyến bằng kỹ thuật <strong className="text-white font-semibold">Ajax tức thì</strong> — không tải lại trang. Hỗ trợ tra cứu xe tập lái DAT, cabin mô phỏng, máy chủ và phòng thi lý thuyết.
          </p>

          {/* Thanh tìm kiếm AJAX Trung Tâm */}
          <div className="max-w-2xl mx-auto pt-2">
            <AjaxSearchBar
              searchQuery={search}
              onSearchChange={handleSearchChange}
              onSelectProduct={(p) => setSelectedProduct(p)}
              placeholder="Nhập tên thiết bị, mã QR (VD: TB-001), biển số xe, phòng ban..."
            />
          </div>

          {/* Gợi ý từ khóa tìm kiếm nhanh & Nút Quét Camera Mobile */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-blue-200">
            <span className="text-blue-300 font-medium">Từ khóa gợi ý:</span>
            {["Xe tập lái", "Cabin mô phỏng", "Máy chấm điểm", "DAT", "Sa hình"].map((kw) => (
              <button
                key={kw}
                onClick={() => handleSearchChange(kw)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition cursor-pointer border border-white/10 active:scale-95"
              >
                {kw}
              </button>
            ))}

            {onOpenScanner && (
              <button
                type="button"
                onClick={onOpenScanner}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/30 hover:bg-emerald-500/40 text-emerald-300 font-semibold border border-emerald-400/40 transition active:scale-95 cursor-pointer shadow-sm"
              >
                <Scan className="w-3.5 h-3.5" />
                <span>Bật Camera quét QR</span>
              </button>
            )}
          </div>

          {/* Thẻ Thống Kê Nhanh (Stats Quick Counters) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto pt-6 text-left">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl">
              <span className="text-xs text-blue-200 block font-medium">Tổng thiết bị</span>
              <div className="text-2xl sm:text-3xl font-bold text-white mt-0.5">
                {stats.total || totalProducts || "—"}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl">
              <span className="text-xs text-emerald-300 block font-medium">Đang hoạt động tốt</span>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-0.5">
                {stats.active || "98%"}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl">
              <span className="text-xs text-amber-300 block font-medium">Bảo trì / Kiểm định</span>
              <div className="text-2xl sm:text-3xl font-bold text-amber-300 mt-0.5">
                {stats.maintenance || 0}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl">
              <span className="text-xs text-blue-200 block font-medium">Khu vực & Đội xe</span>
              <div className="text-2xl sm:text-3xl font-bold text-white mt-0.5">
                {departments.length || 7}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BỘ LỌC AJAX & DANH SÁCH KẾT QUẢ ================= */}
      <main ref={resultsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-6">
        {/* Card Bộ Lọc Đa Chiều */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-blue-900/5 border border-gray-100 space-y-5">
          {/* Header bộ lọc & Nút Reset */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <span>BỘ LỌC THÔNG MINH (AJAX FILTER)</span>
              {loading && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Đang đồng bộ Ajax...
                </span>
              )}
            </div>

            {isFilterActive && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition cursor-pointer self-start sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Đặt lại bộ lọc
              </button>
            )}
          </div>

          {/* Danh mục Phòng ban (Quick Filter Chips) */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Khu vực / Phòng ban sát hạch:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1.5 touch-pan-x flex-nowrap sm:flex-wrap -mx-1 px-1">
              <button
                onClick={() => handleDeptSelect("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border shrink-0 ${
                  selectedDept === "all"
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                }`}
              >
                Tất cả phòng ban
              </button>

              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => handleDeptSelect(dept)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border shrink-0 ${
                    selectedDept === dept
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Lọc theo Trạng Thái & Thể Loại */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                Tình trạng thiết bị:
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3.5 py-2.5 bg-gray-50 text-gray-800 text-xs font-medium rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {categories.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Phân loại thiết bị:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3.5 py-2.5 bg-gray-50 text-gray-800 text-xs font-medium rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                >
                  <option value="all">Tất cả loại thiết bị</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Thanh Điều Khiển Kết Quả (Results Header Bar) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div className="text-sm text-gray-600">
            {loading ? (
              <span className="font-medium text-blue-600">Đang tìm kiếm dữ liệu qua Ajax...</span>
            ) : (
              <span>
                Tìm thấy <strong className="text-gray-900 font-bold">{totalProducts}</strong> kết quả phù hợp
                {search && (
                  <> cho từ khóa &quot;<strong className="text-blue-600">{search}</strong>&quot;</>
                )}
                {selectedDept !== "all" && (
                  <> tại &quot;<span className="text-gray-900 font-medium">{selectedDept}</span>&quot;</>
                )}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-gray-400 hidden sm:inline">Chế độ xem:</span>
            <div className="bg-white p-1 rounded-xl border border-gray-200 flex items-center shadow-xs">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                title="Dạng thẻ (Grid)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === "table"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                title="Dạng bảng (Table)"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ================= KHUNG KẾT QUẢ AJAX ================= */}
        {loading ? (
          /* SKELETON LOADING STATE */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-4 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="w-20 h-6 bg-gray-200 rounded-lg" />
                  <div className="w-16 h-6 bg-gray-200 rounded-lg" />
                </div>
                <div className="w-3/4 h-5 bg-gray-200 rounded" />
                <div className="w-1/2 h-4 bg-gray-100 rounded" />
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="w-12 h-4 bg-gray-100 rounded" />
                  <div className="w-24 h-8 bg-gray-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          /* TRẠNG THÁI RỖNG (EMPTY STATE) */
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Không tìm thấy thiết bị phù hợp
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Không có kết quả nào khớp với yêu cầu tìm kiếm của bạn. Hãy thử thay đổi từ khóa hoặc đặt lại bộ lọc.
            </p>
            {isFilterActive && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Đặt lại tất cả bộ lọc
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4.5">
            {products.map((p) => {
              const isActive = p.status === "Hoạt động" || p.status === "active";
              const isMaintenance = p.status === "Đang bảo trì" || p.status === "maintenance";
              const isBroken = p.status === "Hỏng" || p.status === "broken";

              return (
                <div
                  key={p._id}
                  onClick={() => setSelectedProduct(p)}
                  className="group bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition">
                        {p.code}
                      </span>

                      {/* Trạng thái badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : isMaintenance
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : isBroken
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive
                              ? "bg-emerald-500 animate-pulse"
                              : isMaintenance
                              ? "bg-amber-500"
                              : isBroken
                              ? "bg-rose-500"
                              : "bg-blue-500"
                          }`}
                        />
                        {p.status || "Hoạt động"}
                      </span>
                    </div>

                    {/* Name & Category */}
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
                        {p.name}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {p.category || "Trang thiết bị GPLX"}
                      </p>
                    </div>

                    {/* Department & Vehicle */}
                    <div className="space-y-1.5 text-xs text-gray-600 pt-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">{p.department || "Ban Quản Lý"}</span>
                      </div>

                      {p.assignedVehicle && (
                        <div className="flex items-center gap-1.5 font-medium text-amber-800 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/60 w-fit">
                          <Car className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Xe: {p.assignedVehicle}</span>
                        </div>
                      )}

                      {p.serialNumber && !p.assignedVehicle && (
                        <div className="flex items-center gap-1.5 text-gray-500 font-mono text-[11px] truncate">
                          <Cpu className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">SN: {p.serialNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700">
                      SL: <strong className="text-blue-600">{p.quantity || 1}</strong>
                    </span>

                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-50 group-hover:bg-blue-600 text-gray-600 group-hover:text-white font-semibold transition"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Xem & QR</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[11px] border-b border-gray-100">
                  <tr>
                    <th className="py-3.5 px-4">Mã</th>
                    <th className="py-3.5 px-4">Tên thiết bị</th>
                    <th className="py-3.5 px-4">Phòng ban</th>
                    <th className="py-3.5 px-4">Xe / Serial</th>
                    <th className="py-3.5 px-4 text-center">Số lượng</th>
                    <th className="py-3.5 px-4 text-center">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => (
                    <tr
                      key={p._id}
                      onClick={() => setSelectedProduct(p)}
                      className="hover:bg-blue-50/50 transition cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                        {p.code}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900 group-hover:text-blue-600 transition">
                        <div>{p.name}</div>
                        <div className="text-[11px] text-gray-400 font-normal">{p.category}</div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                        {p.department}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {p.assignedVehicle ? (
                          <span className="font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs">
                            {p.assignedVehicle}
                          </span>
                        ) : p.serialNumber ? (
                          <span className="font-mono text-gray-500 text-xs">{p.serialNumber}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-gray-900">
                        {p.quantity || 1}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          {p.status || "Hoạt động"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          className="px-3 py-1 bg-gray-100 group-hover:bg-blue-600 group-hover:text-white rounded-lg text-xs font-semibold transition"
                        >
                          Xem
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= PHÂN TRANG AJAX (KHÔNG RELOAD TRANG) ================= */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-gray-200">
            <span className="text-xs text-gray-500">
              Trang <strong className="text-gray-900">{page}</strong> trên <strong className="text-gray-900">{totalPages}</strong> (Tổng {totalProducts} thiết bị)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trước</span>
              </button>

              {/* Danh sách nút số trang */}
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pNum = i + 1;
                  // Chỉ hiển thị tối đa 5 trang xung quanh trang hiện tại
                  if (
                    pNum === 1 ||
                    pNum === totalPages ||
                    (pNum >= page - 1 && pNum <= page + 1)
                  ) {
                    return (
                      <button
                        key={pNum}
                        onClick={() => handlePageChange(pNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer ${
                          page === pNum
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  }
                  if (pNum === page - 2 || pNum === page + 2) {
                    return <span key={pNum} className="px-1 text-gray-400 text-xs">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-xs"
              >
                <span>Sau</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL CHI TIẾT & QR CODE QUA AJAX ================= */}
      {selectedProduct && (
        <AjaxSearchDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
