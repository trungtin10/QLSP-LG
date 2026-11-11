import { 
  CheckCircle2, 
  Wrench, 
  AlertTriangle, 
  Clock, 
  Archive 
} from "lucide-react";

export const DEFAULT_DEPARTMENTS = [
  { name: "Phòng Thi Lý Thuyết", code: "P_LYTHUYET", area: "Tầng 2 - Nhà Điều Hành", description: "Gồm 30 máy trạm thi lý thuyết và 01 máy chủ điều hành" },
  { name: "Phòng Thi Mô Phỏng", code: "P_MOPHONG", area: "Tầng 2 - Nhà Điều Hành", description: "Gồm 15 máy tính mô phỏng cabin giao thông" },
  { name: "Phòng Máy Chủ & Giám Sát", code: "P_SERVER", area: "Tầng 3 - Nhà Điều Hành", description: "Chứa hệ thống Server dữ liệu, Switch mạng và màn hình camera sân thi" },
  { name: "Sân Sát Hạch Sa Hình", code: "SAN_SATHACH", area: "Khu vực sân bãi", description: "Khu vực xe thi sát hạch các hạng B1, B2, C" },
  { name: "Đội Xe Tập Lái Thực Hành", code: "XE_TAPLAI", area: "Khu vực xe thực hành", description: "Các xe gắn thiết bị DAT chạy đường trường và sân tập" },
  { name: "Phòng Tuyển Sinh", code: "P_TUYENSINH", area: "Tầng 1 - Nhà Điều Hành", description: "Tiếp nhận hồ sơ và tư vấn học viên" },
  { name: "Phòng Đào Tạo", code: "P_DAOTAO", area: "Tầng 2 - Nhà Điều Hành", description: "Xếp lịch học và quản lý tiến độ đào tạo" },
  { name: "Phòng Kế Toán", code: "P_KETOAN", area: "Tầng 1 - Nhà Điều Hành", description: "Quản lý thu chi học phí và tài sản" },
  { name: "Kho Lưu Trữ Thiết Bị", code: "KHO_THIETBI", area: "Tầng 1 - Kho vật tư", description: "Lưu kho máy móc, linh kiện dự phòng" },
];

export const DEFAULT_CATEGORIES = [
  { name: "Laptop (Máy tính xách tay)", code: "LAPTOP", description: "Máy tính xách tay phục vụ chấm thi, văn phòng" },
  { name: "Máy tính để bàn (PC)", code: "PC", description: "Máy trạm phòng thi lý thuyết, mô phỏng và phòng làm việc" },
  { name: "Thiết bị DAT (Giám sát hành trình)", code: "DAT", description: "Thiết bị giám sát thời gian và quãng đường học thực hành" },
  { name: "Cabin tập lái mô phỏng", code: "CABIN", description: "Hệ thống cabin mô phỏng lái xe điện tử" },
  { name: "Màn hình máy tính", code: "MONITOR", description: "Màn hình giám sát và hiển thị kết quả" },
  { name: "Máy chủ Server & Lưu trữ", code: "SERVER", description: "Máy chủ cơ sở dữ liệu và hệ thống lưu trữ camera" },
  { name: "Thiết bị mạng (Switch / Router / Wifi)", code: "NETWORK", description: "Hạ tầng mạng nội bộ và đường truyền dữ liệu" },
  { name: "Máy in / Máy quét (Scanner)", code: "PRINTER", description: "Thiết bị in ấn chứng chỉ, hồ sơ và scan tài liệu" },
  { name: "Camera giám sát", code: "CAMERA", description: "Camera quan sát phòng thi, cabin và sân sát hạch" },
  { name: "Xe sát hạch / Xe tập lái", code: "VEHICLE", description: "Phương tiện gắn cảm biến chấm điểm tự động" },
  { name: "Khác", code: "OTHER", description: "Thiết bị phụ trợ khác" },
];

export const STATUS_CONFIG = {
  "Hoạt động": { label: "Hoạt động", color: "bg-emerald-950/70 text-emerald-300 border-emerald-700/80", icon: CheckCircle2, dot: "🟢" },
  "active": { label: "Hoạt động", color: "bg-emerald-950/70 text-emerald-300 border-emerald-700/80", icon: CheckCircle2, dot: "🟢" },
  "Đang bảo trì": { label: "Đang bảo trì", color: "bg-amber-950/70 text-amber-300 border-amber-700/80", icon: Wrench, dot: "🟡" },
  "maintenance": { label: "Đang bảo trì", color: "bg-amber-950/70 text-amber-300 border-amber-700/80", icon: Wrench, dot: "🟡" },
  "Hỏng": { label: "Hỏng", color: "bg-rose-950/70 text-rose-300 border-rose-700/80", icon: AlertTriangle, dot: "🔴" },
  "broken": { label: "Hỏng", color: "bg-rose-950/70 text-rose-300 border-rose-700/80", icon: AlertTriangle, dot: "🔴" },
  "Dự phòng": { label: "Dự phòng", color: "bg-blue-950/70 text-blue-300 border-blue-700/80", icon: Clock, dot: "🔵" },
  "storage": { label: "Dự phòng", color: "bg-blue-950/70 text-blue-300 border-blue-700/80", icon: Clock, dot: "🔵" },
  "Thanh lý": { label: "Thanh lý", color: "bg-slate-800 text-slate-300 border-slate-600", icon: Archive, dot: "⚪" },
  "liquidation": { label: "Thanh lý", color: "bg-slate-800 text-slate-300 border-slate-600", icon: Archive, dot: "⚪" },
};
