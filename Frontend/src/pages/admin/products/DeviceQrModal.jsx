import { useState, useRef } from "react";
import { QrCode, X, Printer, Download, Copy, ExternalLink, Check } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";

export default function DeviceQrModal({ product, onClose }) {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  if (!product) return null;

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
    link.download = `QR_${product.code}_${product.name.replace(/\s+/g, "_")}.png`;
    link.click();
    toast.success(`Đã tải xuống mã QR của [${product.code}]`);
  };

  const handlePrintLabel = () => {
    const qrImage = getQrDataUrl();
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.warning("Vui lòng cho phép mở cửa sổ popup để in tem dán!");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tem QR - ${product.code}</title>
          <style>
            @media print {
              @page { margin: 4mm; size: auto; }
              body { margin: 0; padding: 0; }
            }
            body { 
              font-family: 'Segoe UI', Arial, Helvetica, sans-serif; 
              margin: 0; 
              padding: 10px; 
              text-align: center; 
              background: #fff;
              color: #000;
            }
            .label-box { 
              width: 250px; 
              border: 2px dashed #000; 
              padding: 12px; 
              border-radius: 8px; 
              margin: 0 auto; 
              box-sizing: border-box; 
              text-align: center; 
              background: #fff;
            }
            .header {
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              color: #111;
              margin-bottom: 6px;
              letter-spacing: 0.5px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 4px;
            }
            .qr-img { 
              width: 170px; 
              height: 170px; 
              margin: 0 auto 6px; 
              display: block; 
            }
            .code { 
              font-size: 16px; 
              font-weight: 900; 
              letter-spacing: 1.5px; 
              color: #000; 
              text-transform: uppercase; 
              font-family: 'Courier New', Courier, monospace;
            }
            .name {
              font-size: 12px;
              font-weight: bold;
              color: #222;
              margin: 4px 0 6px;
              line-height: 1.3;
            }
            .info-table {
              width: 100%;
              border-top: 1px dashed #aaa;
              margin-top: 6px;
              padding-top: 6px;
              text-align: left;
              font-size: 11px;
              line-height: 1.5;
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
              font-size: 8.5px;
              color: #666;
              margin-top: 8px;
              word-break: break-all;
              border-top: 1px solid #eee;
              padding-top: 4px;
            }
          </style>
        </head>
        <body>
          <div class="label-box">
            <div class="header">HỆ THỐNG QUẢN LÝ THIẾT BỊ GPLX</div>
            <img class="qr-img" src="${qrImage}" alt="${product.code}" />
            <div class="code">${product.code}</div>
            <div class="name">${product.name}</div>
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
                <span class="info-label">SĐT liên hệ:</span>
                <span class="info-val">${product.managerPhone || "—"}</span>
              </div>
            </div>
            <div class="url">${scanUrl}</div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <QrCode className="w-4 h-4 text-blue-400" />
            Mã QR Định Danh Thiết Bị
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 text-center space-y-4">
          {/* Vùng hiển thị Canvas QR Code thế hệ mới, tự động lấy domain hiện tại */}
          <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-300 inline-block">
            <QRCodeCanvas
              id="device-qr-canvas"
              ref={canvasRef}
              value={scanUrl}
              size={210}
              level="H"
              marginSize={2}
              className="mx-auto rounded-lg"
            />
            <p className="mt-2 text-xs font-mono font-black text-slate-900 tracking-wider">
              {product.code}
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
                SĐT liên hệ: <strong className="text-emerald-400 font-mono">{product.managerPhone}</strong>
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

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={handlePrintLabel}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              In tem dán
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
    </div>
  );
}
