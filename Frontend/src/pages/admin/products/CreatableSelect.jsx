import { useState, useEffect, useRef, useMemo } from "react";
import { X, ChevronDown } from "lucide-react";

export default function CreatableSelect({
  label,
  required = false,
  placeholder = "Nhập hoặc chọn...",
  options = [],
  value = "",
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const wrapperRef = useRef(null);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!inputValue.trim()) return options;
    const term = inputValue.toLowerCase().trim();
    return options.filter((o) => {
      const name = typeof o === "string" ? o : o.name;
      return name && name.toLowerCase().includes(term);
    });
  }, [options, inputValue]);

  const handleSelect = (optName) => {
    setInputValue(optName);
    onChange(optName);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputValue("");
    onChange("");
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 shadow-xs transition">
        <input
          type="text"
          required={required && !inputValue.trim()}
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => {
            const val = e.target.value;
            setInputValue(val);
            onChange(val);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full bg-transparent border-none outline-hidden text-xs text-slate-900 placeholder-slate-400"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer mr-1"
            title="Xóa lựa chọn"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-56 overflow-y-auto py-1 text-xs">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => {
              const optName = typeof opt === "string" ? opt : opt.name;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(optName)}
                  className="px-3 py-2 hover:bg-blue-50 text-slate-800 cursor-pointer font-medium flex items-center justify-between"
                >
                  <span>{optName}</span>
                  {inputValue === optName && <span className="text-blue-600 font-bold">✓</span>}
                </div>
              );
            })
          ) : (
            <div
              onClick={() => {
                onChange(inputValue.trim());
                setIsOpen(false);
              }}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 cursor-pointer font-medium flex items-center gap-1.5"
            >
              <span>➕ Sử dụng tên mới:</span>
              <strong className="underline">{inputValue}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
