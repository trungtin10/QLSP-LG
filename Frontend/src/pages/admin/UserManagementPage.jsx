import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import userService from "../../services/userService";
import { 
  Users, 
  UserPlus, 
  Search, 
  Crown, 
  ShieldCheck, 
  User, 
  Edit3, 
  Trash2, 
  Lock, 
  Unlock, 
  X, 
  Loader2, 
  Calendar, 
  Mail, 
  CheckCircle2, 
  Ban,
  KeyRound
} from "lucide-react";

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    role: "user",
    status: "active",
  });

  // Tải danh sách người dùng từ MongoDB
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getUsers({
        search,
        role: selectedRole,
      });
      setUsers(res.users || []);
    } catch (err) {
      toast.error("Không thể tải danh sách tài khoản từ MongoDB!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedRole]);

  // Mở modal thêm người dùng
  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      fullName: "",
      username: "",
      email: "",
      password: "",
      role: "user",
      status: "active",
    });
    setIsModalOpen(true);
  };

  // Mở modal sửa người dùng
  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setFormData({
      fullName: u.fullName,
      username: u.username,
      email: u.email || "",
      password: "", // Để trống nếu không muốn đổi pass
      role: u.role,
      status: u.status,
    });
    setIsModalOpen(true);
  };

  // Submit Lưu/Update trực tiếp lên MongoDB
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.username.trim()) {
      toast.warning("Vui lòng nhập họ tên và tên đăng nhập!");
      return;
    }

    if (!editingUser && !formData.password) {
      toast.warning("Vui lòng nhập mật khẩu cho tài khoản mới!");
      return;
    }

    try {
      setSubmitting(true);
      if (editingUser) {
        await userService.updateUser(editingUser._id, formData);
        toast.success(`Đã cập nhật tài khoản [${formData.username}] trên MongoDB thành công!`);
      } else {
        await userService.createUser(formData);
        toast.success(`Đã tạo tài khoản [${formData.username}] vào MongoDB thành công!`);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi khi lưu thông tin người dùng!";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Đổi nhanh trạng thái Khóa / Mở khóa
  const handleToggleStatus = async (u) => {
    if (u._id === currentUser?._id) {
      toast.warning("Bạn không thể tự khóa tài khoản của chính mình!");
      return;
    }

    const newStatus = u.status === "active" ? "blocked" : "active";
    try {
      await userService.updateUser(u._id, { status: newStatus });
      toast.success(newStatus === "active" ? `Đã mở khóa [${u.username}]` : `Đã khóa tài khoản [${u.username}]`);
      setUsers((prev) =>
        prev.map((item) => (item._id === u._id ? { ...item, status: newStatus } : item))
      );
    } catch (err) {
      toast.error("Lỗi khi cập nhật trạng thái!");
    }
  };

  // Xóa vĩnh viễn khỏi MongoDB
  const handleDelete = async (u) => {
    if (u._id === currentUser?._id) {
      toast.warning("Bạn không thể tự xóa tài khoản của chính mình!");
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản [${u.username} - ${u.fullName}] khỏi MongoDB?`)) {
      return;
    }

    try {
      await userService.deleteUser(u._id);
      toast.success(`Đã xóa vĩnh viễn tài khoản [${u.username}] khỏi MongoDB!`);
      setUsers((prev) => prev.filter((item) => item._id !== u._id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi xóa tài khoản!");
    }
  };

  // Đếm nhanh số lượng theo role
  const superCount = users.filter((u) => u.role === "superadmin").length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.filter((u) => u.role === "user").length;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header & Button Thêm mới */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-500" />
            Quản Trị Người Dùng & Phân Quyền (MongoDB)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Quản lý, cấp quyền và cập nhật trực tiếp dữ liệu người dùng trong cơ sở dữ liệu MongoDB
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Thêm người dùng mới
        </button>
      </div>

      {/* Thẻ Thống Kê Nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Tổng tài khoản</p>
            <p className="text-2xl font-bold text-white mt-0.5">{users.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-purple-400 font-semibold">Superadmin</p>
            <p className="text-2xl font-bold text-white mt-0.5">{superCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-800/50 flex items-center justify-center">
            <Crown className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-400 font-semibold">Admin Quản trị</p>
            <p className="text-2xl font-bold text-white mt-0.5">{adminCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-950/60 text-blue-400 border border-blue-800/50 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-400 font-semibold">Học viên / User</p>
            <p className="text-2xl font-bold text-white mt-0.5">{userCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tìm Kiếm & Lọc Theo Role */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Ô Tìm Kiếm */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo Họ tên, Tên đăng nhập (username), Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Lọc Theo Vai Trò */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { key: "all", label: "Tất cả vai trò" },
            { key: "superadmin", label: "Superadmin" },
            { key: "admin", label: "Admin" },
            { key: "user", label: "Học viên" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedRole(tab.key)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                selectedRole === tab.key
                  ? "bg-blue-600 text-white font-semibold shadow-xs"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bảng Danh Sách Người Dùng Trực Tiếp Từ MongoDB */}
      <div className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
            <p className="text-xs">Đang đồng bộ dữ liệu người dùng từ MongoDB...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">Không tìm thấy tài khoản nào</p>
            <p className="text-xs text-slate-500 mt-1">Bấm "Thêm người dùng mới" để tạo tài khoản vào MongoDB.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4">Tên Người Dùng & Username</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-center">Vai Trò (Role)</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4">Đăng Nhập Gần Nhất</th>
                  <th className="py-3 px-4 text-center">Thao Tác (Update / Xoá)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {users.map((u, index) => {
                  const isSelf = u._id === currentUser?._id;
                  return (
                    <tr key={u._id} className="hover:bg-slate-900/60 transition">
                      <td className="py-3.5 px-4 text-center text-slate-500 font-medium">
                        {index + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold border border-slate-700">
                            {u.fullName?.charAt(0) || <User className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {u.fullName} {isSelf && <span className="text-[10px] text-blue-400 font-normal">(Bạn)</span>}
                            </p>
                            <p className="text-[11px] font-mono text-blue-400">@{u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {u.email || <span className="text-slate-600">Chưa gán</span>}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {u.role === "superadmin" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800/80 uppercase">
                            <Crown className="w-3 h-3 text-purple-400" />
                            Superadmin
                          </span>
                        ) : u.role === "admin" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800/80 uppercase">
                            <ShieldCheck className="w-3 h-3 text-blue-400" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 uppercase">
                            <User className="w-3 h-3 text-emerald-400" />
                            Học viên
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {u.status === "active" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950 text-rose-300 border border-rose-800">
                            <Ban className="w-3 h-3 text-rose-400" />
                            Bị khóa
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleString("vi-VN") : "Chưa đăng nhập"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Nút Sửa / Update */}
                          <button
                            onClick={() => handleOpenEdit(u)}
                            title="Chỉnh sửa thông tin trên MongoDB"
                            className="p-1.5 text-blue-400 hover:text-white hover:bg-blue-950/60 rounded-lg transition cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Nút Khóa / Mở Khóa */}
                          {!isSelf && (
                            <button
                              onClick={() => handleToggleStatus(u)}
                              title={u.status === "active" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                              className={`p-1.5 rounded-lg transition cursor-pointer ${
                                u.status === "active"
                                  ? "text-amber-400 hover:bg-amber-950/60"
                                  : "text-emerald-400 hover:bg-emerald-950/60"
                              }`}
                            >
                              {u.status === "active" ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </button>
                          )}

                          {/* Nút Xóa */}
                          {!isSelf && (
                            <button
                              onClick={() => handleDelete(u)}
                              title="Xóa vĩnh viễn khỏi MongoDB"
                              className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

      {/* ================= MODAL THÊM / CẬP NHẬT NGƯỜI DÙNG (MONGODB) ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                {editingUser ? `Cập Nhật Tài Khoản: @${editingUser.username}` : "Thêm Tài Khoản Người Dùng Mới"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Họ và tên */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nguyễn Văn A..."
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tên đăng nhập (username) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tên đăng nhập (Username) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: nguyen_van_a..."
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().trim() })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Địa chỉ Email (tùy chọn)
                </label>
                <input
                  type="email"
                  placeholder="user@gplx.vn..."
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Mật khẩu */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>{editingUser ? "Đổi mật khẩu mới (Bỏ trống nếu không đổi)" : "Mật khẩu ban đầu *"}</span>
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                </label>
                <input
                  type="password"
                  placeholder={editingUser ? "•••••••• (Giữ nguyên mật khẩu cũ)" : "Tối thiểu 6 ký tự..."}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Vai trò & Trạng thái */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Vai trò (Role)
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">👤 Học viên (User)</option>
                    <option value="admin">🛡️ Admin Quản trị</option>
                    <option value="superadmin">👑 Superadmin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="blocked">Bị khóa</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  {editingUser ? "Cập nhật vào MongoDB" : "Tạo tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
