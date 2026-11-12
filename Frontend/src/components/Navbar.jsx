import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  Car, 
  ShieldCheck, 
  LogOut, 
  User, 
  Search, 
  Loader2, 
  X, 
  Package, 
  ArrowRight,
  Building2,
  Scan 
} from "lucide-react";
import { toast } from "sonner";
import productService from "../services/productService";
import AjaxSearchDetailModal from "./search/AjaxSearchDetailModal";

export default function Navbar({ onOpenScanner }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  // Trạng thái tìm kiếm nhanh trên thanh điều hướng
  const [navSearch, setNavSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const searchBoxRef = useRef(null);
  const abortRef = useRef(null);

  const handleLogout = () => {
    logout();
    toast.info("Đã đăng xuất khỏi tài khoản!");
    navigate("/login");
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // AJAX tìm kiếm tức thì trên Navbar (Debounce 250ms)
  useEffect(() => {
    const trimmed = navSearch.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await productService.searchPublic(
          { search: trimmed, limit: 5 },
          { signal: abortRef.current.signal }
        );
        if (res && res.products) {
          setSuggestions(res.products);
          setShowDropdown(true);
        }
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error("Lỗi tìm kiếm Navbar:", err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [navSearch]);

  const handleNavSearchSubmit = (e) => {
    e.preventDefault();
    setShowDropdown(false);
    setIsMobileSearchOpen(false);
    if (navSearch.trim()) {
      // Chuyển hướng hoặc cuộn về trang chủ với từ khóa tìm kiếm
      navigate(`/home?q=${encodeURIComponent(navSearch.trim())}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo */}
            <Link to="/home" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:bg-blue-700 transition">
                <Car className="w-6 h-6" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-base sm:text-lg text-gray-900 leading-tight">
                  GPLX VIỆT NAM
                </span>
                <span className="text-[11px] text-blue-600 font-semibold tracking-wide">
                  Hệ Thống Trực Tuyến
                </span>
              </div>
            </Link>

            {/* Thanh Tìm Kiếm Nhanh Ajax trên Desktop */}
            <div ref={searchBoxRef} className="hidden md:flex flex-1 max-w-md mx-4 relative">
              <form onSubmit={handleNavSearchSubmit} className="w-full relative">
                <input
                  type="text"
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowDropdown(true);
                  }}
                  placeholder="Tìm nhanh thiết bị, mã QR, xe..."
                  className="w-full pl-9 pr-8 py-2 bg-gray-50 hover:bg-gray-100/80 focus:bg-white text-xs sm:text-sm text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {isSearching ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  ) : (
                    <Search className="w-3.5 h-3.5" />
                  )}
                </div>
                {navSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setNavSearch("");
                      setShowDropdown(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Dropdown Gợi Ý Nhanh Ajax */}
              {showDropdown && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fadeIn">
                  <div className="p-2 bg-gray-50 border-b border-gray-100 text-[11px] text-gray-500 flex justify-between">
                    <span>Gợi ý tra cứu nhanh (Ajax)</span>
                    <span>{suggestions.length} kết quả</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                    {suggestions.map((p) => (
                      <div
                        key={p._id}
                        onClick={() => {
                          setSelectedProduct(p);
                          setShowDropdown(false);
                        }}
                        className="p-2.5 hover:bg-blue-50/70 transition cursor-pointer flex items-center justify-between text-left group"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-gray-900 group-hover:text-blue-600 truncate">
                              {p.name}
                            </span>
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-gray-100 text-gray-600">
                              {p.code}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-400 truncate flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 shrink-0" />
                            <span className="truncate">{p.department}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-600 opacity-0 group-hover:opacity-100 transition shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Links & Action buttons */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Nút Quét mã QR bằng Camera */}
              {onOpenScanner && (
                <button
                  type="button"
                  onClick={onOpenScanner}
                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0"
                  title="Quét mã QR bằng Camera điện thoại"
                >
                  <Scan className="w-5 h-5" />
                  <span className="hidden lg:inline text-xs font-semibold">Quét QR</span>
                </button>
              )}

              {/* Nút tìm kiếm trên Mobile */}
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                title="Tìm kiếm"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link
                to="/home"
                className={`text-xs sm:text-sm font-medium transition px-2 py-1 ${
                  location.pathname === "/home"
                    ? "text-blue-600 font-bold"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Trang chủ
              </Link>

              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span className="hidden sm:inline">Quản Trị</span>
                </Link>
              )}

              {isAuthenticated ? (
                <div className="flex items-center gap-2 pl-1">
                  <span className="text-xs font-medium text-gray-700 hidden sm:flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    {user?.fullName || user?.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    title="Đăng xuất"
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>

          {/* Thanh Tìm Kiếm Mobile Khi Mở Rộng */}
          {isMobileSearchOpen && (
            <div className="md:hidden py-2 pb-3 border-t border-gray-100 animate-fadeIn">
              <form onSubmit={handleNavSearchSubmit} className="relative">
                <input
                  type="text"
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  placeholder="Tìm kiếm thiết bị, mã QR..."
                  autoFocus
                  className="w-full pl-9 pr-9 py-2 bg-gray-50 text-xs text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                {navSearch && (
                  <button
                    type="button"
                    onClick={() => setNavSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Modal Xem Nhanh Khi Click Từ Thanh Điều Hướng */}
      {selectedProduct && (
        <AjaxSearchDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
