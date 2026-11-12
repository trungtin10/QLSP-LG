import { useState, useRef } from "react";
import { QrCode, X, Printer, Download, Copy, ExternalLink, Check, Sliders, LayoutGrid } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";

// Các kích thước tem in tiêu chuẩn cho các loại máy in tem nhãn và A4
const SIZE_PRESETS = [
  {
    id: "sm",
    label: "Nhỏ (S)",
    sub: "40×35 mm",
    qrDisplaySize: 150,
    printBoxWidth: 190,
    printQrSize: 130,
    headerSize: 10,
    codeSize: 13,
    nameSize: 11,
    infoSize: 9.5,
  },
  {
    id: "md",
    label: "Chuẩn (M)",
    sub: "60×50 mm",
    qrDisplaySize: 200,
    printBoxWidth: 250,
    printQrSize: 170,
    headerSize: 11,
    codeSize: 16,
    nameSize: 12,
    infoSize: 11,
  },
  {
    id: "lg",
    label: "Lớn (L)",
    sub: "80×70 mm",
    qrDisplaySize: 240,
    printBoxWidth: 320,
    printQrSize: 220,
    headerSize: 12.5,
    codeSize: 18,
    nameSize: 13.5,
    infoSize: 12,
  },
  {
    id: "xl",
    label: "Đại (XL)",
    sub: "100×90 mm",
    qrDisplaySize: 270,
    printBoxWidth: 390,
    printQrSize: 270,
    headerSize: 14,
    codeSize: 22,
    nameSize: 15,
    infoSize: 13.5,
  },
];

export default function DeviceQrModal({ product, onClose }) {
  const [copied, setCopied] = useState(false);
  const [templateType, setTemplateType] = useState("compact"); // "compact": Chuẩn Hình 4 (Mặc định) | "detailed": Đầy đủ
  const [selectedSizeId, setSelectedSizeId] = useState("md");
  const [customQrSize, setCustomQrSize] = useState(200);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const canvasRef = useRef(null);

  if (!product) return null;

  // Lấy cấu hình kích thước hiện tại
  const currentPreset = SIZE_PRESETS.find((s) => s.id === selectedSizeId) || SIZE_PRESETS[1];
  
  // Kích thước QR hiển thị trên màn hình
  const activeQrSize = isCustomMode ? customQrSize : currentPreset.qrDisplaySize;
  
  // Kích thước khi in thực tế (tính theo tỷ lệ nếu ở chế độ tùy chỉnh)
  const printWidth = isCustomMode ? Math.round(customQrSize * 1.3) : currentPreset.printBoxWidth;
  const printQr = isCustomMode ? customQrSize : currentPreset.printQrSize;
  const headerFont = isCustomMode ? Math.max(9, Math.round(customQrSize * 0.055)) : currentPreset.headerSize;
  const codeFont = isCustomMode ? Math.max(12, Math.round(customQrSize * 0.08)) : currentPreset.codeSize;
  const nameFont = isCustomMode ? Math.max(10, Math.round(customQrSize * 0.06)) : currentPreset.nameSize;
  const infoFont = isCustomMode ? Math.max(9, Math.round(customQrSize * 0.055)) : currentPreset.infoSize;

  // Luôn lấy URL tra cứu theo domain hiện tại của trình duyệt (ví dụ: https://qlsp-lg.onrender.com/scan/TB-001)
  const scanUrl = `${window.location.origin}/scan/${encodeURIComponent(product.code)}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(scanUrl);
      setCopied(true);
      toast.success("Đã sao chép link tra cứu sản phẩm!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Không thể sao chép liên kết!");
    }
  };

  const getQrDataUrl = () => {
    const canvas = document.getElementById("device-qr-canvas");
    if (canvas) {
      return canvas.toDataURL("image/png");
    }
    return product.qrCode || "";
  };

  const handleDownloadQR = () => {
    const qrImage = getQrDataUrl();
    if (!qrImage) {
      toast.error("Không thể tạo ảnh QR để tải về!");
      return;
    }
    const link = document.createElement("a");
    link.href = qrImage;
    link.download = `QR_${product.code}_${product.name.replace(/\s+/g, "_")}_${activeQrSize}px.png`;
    link.click();
    toast.success(`Đã tải xuống mã QR (${activeQrSize}px) của [${product.code}]`);
  };

  const handlePrintLabel = () => {
    const qrImage = getQrDataUrl();
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.warning("Vui lòng cho phép mở cửa sổ popup để in tem dán!");
      return;
    }

    const isCompact = templateType === "compact";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tem QR - ${product.code}</title>
          <style>
            @media print {
              @page { margin: 2mm; size: auto; }
              body { margin: 0; padding: 0; }
            }
            body { 
              font-family: 'Segoe UI', Arial, Helvetica, sans-serif; 
              margin: 0; 
              padding: 8px; 
              text-align: center; 
              background: #fff;
              color: #000;
            }
            .label-box { 
              width: ${printWidth}px; 
              border: 2px dashed #000; 
              padding: ${isCompact ? "12px 10px" : "10px"}; 
              border-radius: 8px; 
              margin: 0 auto; 
              box-sizing: border-box; 
              text-align: center; 
              background: #fff;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .header {
              font-size: ${headerFont}px;
              font-weight: 800;
              text-transform: uppercase;
              color: #111;
              margin-bottom: 5px;
              letter-spacing: 0.5px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 3px;
            }
            .qr-img { 
              width: ${printQr}px; 
              height: ${printQr}px; 
              margin: 0 auto 5px; 
              display: block; 
            }
            .code { 
              font-size: ${codeFont}px; 
              font-weight: 900; 
              letter-spacing: 1.5px; 
              color: #000; 
              text-transform: uppercase; 
              font-family: 'Courier New', Courier, monospace;
            }
            .name {
              font-size: ${nameFont}px;
              font-weight: bold;
              color: #222;
              margin: 3px 0 0;
              line-height: 1.3;
            }
            .info-table {
              width: 100%;
              border-top: 1px dashed #aaa;
              margin-top: 5px;
              padding-top: 5px;
              text-align: left;
              font-size: ${infoFont}px;
              line-height: 1.45;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
            }
            .info-label {
              color: #555;
              font-weight: normal;
            }
            .info-val {
              color: #000;
              font-weight: 700;
              text-align: right;
            }
            .url {
              font-size: 8px;
              color: #666;
              margin-top: 6px;
              word-break: break-all;
              border-top: 1px solid #eee;
              padding-top: 3px;
            }
          </style>
        </head>
        <body>
          <div class="label-box">
            <div class="header">HỆ THỐNG QUẢN LÝ THIẾT BỊ GPLX</div>
            <img class="qr-img" src="${qrImage}" alt="${product.code}" />
            <div class="code">${product.code}</div>
            <div class="name">${product.name}</div>
            ${
              !isCompact
                ? `
            <div class="info-table">
              <div class="info-row">
                <span class="info-label">Vị trí:</span>
                <span class="info-val">${product.department || "—"}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Người quản lý:</span>
                <span class="info-val">${product.manager || "Ban Quản Lý"}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Số lượng:</span>
                <span class="info-val">${product.quantity || 1}</span>
              </div>
              <div class="info-row">
                <span class="info-label">SDT:</span>
                <span class="info-val">${product.managerPhone || "—"}</span>
              </div>
            </div>
            <div class="url">${scanUrl}</div>
                `
                : ""
            }
          </div>
          <script>
            window.onload = function() { 
              window.print(); 
              window.close(); 
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <QrCode className="w-4 h-4 text-blue-400" />
            Tem & Mã QR Định Danh Thiết Bị
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nội dung Modal (Cuộn mượt) */}
        <div className="p-5 text-center space-y-4 overflow-y-auto flex-1">
          {/* ================= CHỌN MẪU TEM IN ================= */}
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-left space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5 text-blue-400" />
              Chọn kiểu mẫu in tem dán:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setTemplateType("compact")}
                className={`py-2 px-2.5 rounded-lg border text-xs font-semibold transition cursor-pointer text-center ${
                  templateType === "compact"
                    ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30 font-bold"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                Mẫu gọn (Chuẩn Hình 4)
              </button>
              <button
                type="button"
                onClick={() => setTemplateType("detailed")}
                className={`py-2 px-2.5 rounded-lg border text-xs font-semibold transition cursor-pointer text-center ${
                  templateType === "detailed"
                    ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30 font-bold"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                Mẫu đầy đủ chi tiết
              </button>
            </div>
          </div>

          {/* ================= CHỌN KÍCH THƯỚC IN TEM ================= */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-left space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                Kích thước tem in & mã QR:
              </span>
              <button
                type="button"
                onClick={() => setIsCustomMode(!isCustomMode)}
                className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
              >
                {isCustomMode ? "Dùng mẫu chuẩn" : "Tùy chỉnh chi tiết"}
              </button>
            </div>

            {/* Các kích thước tiêu chuẩn (Presets) */}
            {!isCustomMode ? (
              <div className="grid grid-cols-4 gap-1.5">
                {SIZE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedSizeId(preset.id)}
                    className={`p-2 rounded-lg border text-center transition cursor-pointer ${
                      selectedSizeId === preset.id
                        ? "bg-blue-600 border-blue-500 text-white font-bold shadow-md shadow-blue-600/30"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <div className="text-xs">{preset.label}</div>
                    <div className="text-[10px] opacity-75">{preset.sub}</div>
                  </button>
                ))}
              </div>
            ) : (
              /* Thanh trượt tùy chỉnh kích thước */
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Kích thước mã QR:</span>
                  <span className="font-mono font-bold text-blue-400">{customQrSize} px (~{Math.round(customQrSize * 0.32)} mm)</span>
                </div>
                <input
                  type="range"
                  min="120"
                  max="320"
                  step="10"
                  value={customQrSize}
                  onChange={(e) => setCustomQrSize(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>120px (Nhỏ)</span>
                  <span>200px (Chuẩn)</span>
                  <span>320px (Rất lớn)</span>
                </div>
              </div>
            )}
          </div>

          {/* Vùng hiển thị Canvas QR Code thế hệ mới, thay đổi kích thước linh hoạt */}
          <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-300 inline-block transition-all duration-150">
            <QRCodeCanvas
              id="device-qr-canvas"
              ref={canvasRef}
              value={scanUrl}
              size={activeQrSize}
              level="H"
              marginSize={2}
              className="mx-auto rounded-lg"
            />
            <p className="mt-2 text-xs font-mono font-black text-slate-900 tracking-wider">
              {product.code}
            </p>
            <p className="mt-0.5 text-xs font-bold text-slate-800 truncate max-w-[240px]">
              {product.name}
            </p>
          </div>

          {/* Link tra cứu trực tiếp */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2 text-left">
            <div className="truncate flex-1">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Link quét tra cứu:</p>
              <p className="text-xs font-mono text-blue-400 truncate">{scanUrl}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleCopyUrl}
                title="Sao chép link"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href={scanUrl}
                target="_blank"
                rel="noreferrer"
                title="Mở thử link này"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Thông tin thiết bị tóm tắt */}
          <div className="text-left bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-1.5">
            <p className="font-bold text-white text-sm">{product.name}</p>
            <p className="text-slate-400">
              Loại thiết bị: <strong className="text-slate-200">{product.category}</strong>
            </p>
            <p className="text-slate-400">
              Phòng ban / Vị trí: <strong className="text-blue-400">{product.department}</strong>
            </p>
            <p className="text-slate-400">
              Người quản lý: <strong className="text-slate-200">{product.manager || "Ban Quản Lý"}</strong>
            </p>
            <p className="text-slate-400">
              Số lượng: <strong className="text-white font-semibold">{product.quantity || 1}</strong>
            </p>
            {product.managerPhone && (
              <p className="text-slate-400">
                SDT: <strong className="text-emerald-400 font-mono">{product.managerPhone}</strong>
              </p>
            )}
            {product.assignedVehicle && (
              <p className="text-slate-400">
                Biển số xe: <strong className="text-amber-400 font-mono">{product.assignedVehicle}</strong>
              </p>
            )}
            {product.serialNumber && (
              <p className="text-slate-400">
                Số Serial / IMEI: <strong className="text-slate-200 font-mono">{product.serialNumber}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 shrink-0 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handlePrintLabel}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            In tem ({templateType === "compact" ? "Hình 4" : "Chi tiết"})
          </button>
          <button
            type="button"
            onClick={handleDownloadQR}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Tải ảnh PNG
          </button>
        </div>
      </div>
    </div>
  );
}
