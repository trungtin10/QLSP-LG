import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, X, ArrowRight, Building2, Package } from "lucide-react";
import productService from "../../services/productService";

export default function AjaxSearchBar({
  searchQuery = "",
  onSearchChange,
  onSelectProduct,
  placeholder = "Nhập tên thiết bị, mã QR (VD: TB-001), biển số xe, phòng ban...",
  autoFocus = false,
  className = "",
}) {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Đồng bộ khi prop bên ngoài đổi
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  // Click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // AJAX Gợi ý tức thì (Debounced Ajax Suggestions)
  useEffect(() => {
    const trimmed = localQuery.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    // Hủy request Ajax trước đó nếu người dùng đang gõ tiếp
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoadingSuggestions(true);
    const timer = setTimeout(async () => {
      try {
        const res = await productService.searchPublic(
          { search: trimmed, limit: 5 },
          { signal: abortControllerRef.current.signal }
        );
        if (res && res.products) {
          setSuggestions(res.products);
          setIsDropdownOpen(true);
        }
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error("Lỗi AJAX gợi ý tìm kiếm:", err);
        }
      } finally {
        setLoadingSuggestions(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [localQuery]);

  // Submit form bằng AJAX - Tuyệt đối không reload trang
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsDropdownOpen(false);
    if (onSearchChange) {
      onSearchChange(localQuery.trim());
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalQuery(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleClear = () => {
    setLocalQuery("");
    setSuggestions([]);
    setIsDropdownOpen(false);
    if (onSearchChange) {
      onSearchChange("");
    }
  };

  const handleSelectSuggestion = (item) => {
    setIsDropdownOpen(false);
    if (onSelectProduct) {
      onSelectProduct(item);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative flex items-center">
          {/* Search Icon */}
          <div className="absolute left-4 pointer-events-none text-slate-400">
            {loadingSuggestions ? (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>

          {/* Input field */}
          <input
            type="text"
            value={localQuery}
            onChange={handleInputChange}
            onFocus={() => {
              if (suggestions.length > 0) setIsDropdownOpen(true);
            }}
            autoFocus={autoFocus}
            placeholder={placeholder}
            className="w-full pl-12 pr-28 py-3.5 sm:py-4 bg-white text-gray-900 rounded-2xl border border-gray-200 shadow-lg shadow-blue-900/5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm sm:text-base placeholder-gray-400 transition"
          />

          {/* Right Action Buttons */}
          <div className="absolute right-2.5 flex items-center gap-1.5">
            {localQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              className="px-3.5 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Tìm</span>
              <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
            </button>
          </div>
        </div>
      </form>

      {/* AJAX Real-time Suggestions Dropdown */}
      {isDropdownOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-40 animate-fadeIn">
          <div className="p-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium">Gợi ý tìm kiếm nhanh (Ajax)</span>
            <span>{suggestions.length} kết quả khớp</span>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {suggestions.map((item) => (
              <div
                key={item._id}
                onClick={() => handleSelectSuggestion(item)}
                className="p-3 hover:bg-blue-50/70 transition cursor-pointer flex items-center justify-between gap-3 text-left group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition truncate">
                        {item.name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono text-[11px] font-bold shrink-0">
                        {item.code}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5 truncate">
                      <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="truncate">{item.department}</span>
                      {item.assignedVehicle && (
                        <span className="text-amber-700 font-medium">({item.assignedVehicle})</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition shrink-0 flex items-center gap-1">
                  <span>Chi tiết</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 bg-gray-50 text-center border-t border-gray-100">
            <button
              onClick={handleSubmit}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Xem tất cả kết quả cho &quot;{localQuery}&quot;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
