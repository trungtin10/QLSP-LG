import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { BarChart3, Laptop, Building2, Layers } from "lucide-react";
import productService from "../../services/productService";

// Modularized Components
import DeviceTab from "./products/DeviceTab";
import DepartmentTab from "./products/DepartmentTab";
import CategoryTab from "./products/CategoryTab";
import DeviceFormModal from "./products/DeviceFormModal";
import DeviceQrModal from "./products/DeviceQrModal";
import { DEFAULT_DEPARTMENTS, DEFAULT_CATEGORIES } from "./products/constants";

export default function ProductManagementPage() {
  // Tab State: 'devices' | 'departments' | 'categories'
  const [activeTab, setActiveTab] = useState("devices");

  // Dữ liệu thiết bị
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Dữ liệu Phòng ban & Loại thiết bị (từ server)
  const [departments, setDepartments] = useState([]);
  const [deptLoading, setDeptLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [qrModalProduct, setQrModalProduct] = useState(null);

  // ================= LOAD DỮ LIỆU TỪ SERVER =================
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getProducts({
        search,
        department: selectedDept,
        category: selectedCategory,
        status: selectedStatus,
        limit: "all",
      });
      setProducts(res.products || []);
    } catch (err) {
      toast.error("Không thể tải danh sách thiết bị!");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      setDeptLoading(true);
      const res = await productService.getDepartments();
      if (res && res.departments) {
        setDepartments(res.departments);
      } else {
        setDepartments(DEFAULT_DEPARTMENTS);
      }
    } catch (err) {
      setDepartments(DEFAULT_DEPARTMENTS);
    } finally {
      setDeptLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCatLoading(true);
      const res = await productService.getCategories();
      if (res && res.categories) {
        setCategories(res.categories);
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch (err) {
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setCatLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedDept, selectedCategory, selectedStatus]);

  // Danh sách tên cho Form & Filter
  const departmentNames = useMemo(() => departments.map((d) => d.name), [departments]);
  const categoryNames = useMemo(() => categories.map((c) => c.name), [categories]);

  // Tổng số lượng thiết bị thực tế
  const totalQuantity = useMemo(() => {
    return products.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
  }, [products]);

  // ================= HANDLERS THIẾT BỊ =================
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setIsFormOpen(true);
  };

  const handleSubmitProduct = async (formData) => {
    if (!formData.code.trim() || !formData.name.trim() || !formData.department.trim()) {
      toast.warning("Vui lòng điền đủ Mã thiết bị, Tên thiết bị và Phòng ban / Vị trí!");
      return;
    }

    try {
      setSubmitting(true);
      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, formData);
        toast.success(`Cập nhật thiết bị [${formData.code}] thành công!`);
      } else {
        await productService.createProduct(formData);
        toast.success(`Đã thêm thiết bị [${formData.code}] và tạo mã QR thành công!`);
      }
      setIsFormOpen(false);
      await fetchProducts();
      await fetchDepartments();
      await fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu thông tin thiết bị!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id, name, code) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xoá thiết bị [${code} - ${name}]?`)) return;

    try {
      await productService.deleteProduct(id);
      toast.success("Đã xoá thiết bị thành công!");
      setProducts((prev) => prev.filter((p) => p._id !== id));
      await fetchDepartments();
      await fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi xoá thiết bị!");
    }
  };

  // Điều hướng lọc theo phòng ban từ tab Phòng Ban
  const handleFilterByDept = (deptName) => {
    setSelectedDept(deptName);
    setActiveTab("devices");
  };

  // Điều hướng lọc theo loại từ tab Loại Thiết Bị
  const handleFilterByCategory = (catName) => {
    setSelectedCategory(catName);
    setActiveTab("devices");
  };

  return (
    <div className="space-y-5 max-w-7xl">
      {/* ================= TABS ĐIỀU HƯỚNG CHÍNH ================= */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
        >
          <BarChart3 className="w-4 h-4 text-slate-400" />
          Tổng Quan Dashboard
        </Link>

        <button
          onClick={() => setActiveTab("devices")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
            activeTab === "devices"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Laptop className="w-4 h-4" />
          Quản Lý Thiết Bị
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            activeTab === "devices" ? "bg-white text-blue-700" : "bg-slate-800 text-slate-300"
          }`}>
            {totalQuantity}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("departments")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
            activeTab === "departments"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Phòng Ban & Vị Trí
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            activeTab === "departments" ? "bg-white text-blue-700" : "bg-slate-800 text-slate-300"
          }`}>
            {departments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
            activeTab === "categories"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          Loại Thiết Bị
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            activeTab === "categories" ? "bg-white text-blue-700" : "bg-slate-800 text-slate-300"
          }`}>
            {categories.length}
          </span>
        </button>
      </div>

      {/* ================= TAB 1: QUẢN LÝ THIẾT BỊ ================= */}
      {activeTab === "devices" && (
        <DeviceTab
          products={products}
          loading={loading}
          search={search}
          setSearch={setSearch}
          selectedDept={selectedDept}
          setSelectedDept={setSelectedDept}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          departmentNames={departmentNames}
          categoryNames={categoryNames}
          onOpenAdd={handleOpenAdd}
          onOpenEdit={handleOpenEdit}
          onDelete={handleDeleteProduct}
          onOpenQrModal={setQrModalProduct}
        />
      )}

      {/* ================= TAB 2: PHÒNG BAN & VỊ TRÍ ================= */}
      {activeTab === "departments" && (
        <DepartmentTab
          departments={departments}
          deptLoading={deptLoading}
          products={products}
          onRefresh={async () => {
            await fetchDepartments();
            await fetchProducts();
          }}
          onFilterByDept={handleFilterByDept}
        />
      )}

      {/* ================= TAB 3: LOẠI THIẾT BỊ ================= */}
      {activeTab === "categories" && (
        <CategoryTab
          categories={categories}
          catLoading={catLoading}
          products={products}
          onRefresh={async () => {
            await fetchCategories();
            await fetchProducts();
          }}
          onFilterByCategory={handleFilterByCategory}
        />
      )}

      {/* ================= MODAL THÊM / SỬA THIẾT BỊ ================= */}
      <DeviceFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        editingProduct={editingProduct}
        onSubmit={handleSubmitProduct}
        submitting={submitting}
        departmentNames={departmentNames}
        categoryNames={categoryNames}
        defaultDept={selectedDept !== "all" ? selectedDept : departmentNames[0]}
        defaultCategory={selectedCategory !== "all" ? selectedCategory : categoryNames[0]}
      />

      {/* ================= MODAL XEM & IN MÃ QR CODE ================= */}
      <DeviceQrModal
        product={qrModalProduct}
        onClose={() => setQrModalProduct(null)}
      />
    </div>
  );
}
