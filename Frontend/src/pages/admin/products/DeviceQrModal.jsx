import { QrCode, X, Printer, Download } from "lucide-react";
import { toast } from "sonner";

export default function DeviceQrModal({ product, onClose }) {
  if (!product) return null;

  const handleDownloadQR = () => {
    if (!product.qrCode) return;
    const link = document.createElement("a");
    link.href = product.qrCode;
    link.download = `QR_${product.code}_${product.name}.png`;
    link.click();
    toast.success(`Đã tải xuống mã QR của [${product.code}]`);
  };

  const handlePrintLabel = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${product.code}</title>
          <style>
            @media print {
              @page { margin: 5mm; size: auto; }
              body { margin: 0; padding: 0; }
            }
            body { 
              font-family: 'Segoe UI', Arial, sans-serif; 
              margin: 0; 
              padding: 10px; 
              text-align: center; 
              background: #fff;
            }
            .label-box { 
              width: 220px; 
              border: 2px dashed #000; 
              padding: 12px; 
              border-radius: 8px; 
              margin: 0 auto; 
              box-sizing: border-box; 
              text-align: center; 
            }
            .qr-img { 
              width: 190px; 
              height: 190px; 
              margin: 0 auto; 
              display: block; 
            }
            .code { 
              font-size: 18px; 
              font-weight: 900; 
              letter-spacing: 2px; 
              color: #000; 
              margin-top: 8px; 
              text-transform: uppercase; 
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="label-box">
            <img class="qr-img" src="${product.qrCode}" alt="${product.code}" />
            <div class="code">${product.code}</div>
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
          <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-300 inline-block">
            <img
              src={product.qrCode}
              alt={product.code}
              className="w-56 h-56 mx-auto rounded-lg"
            />
            <p className="mt-2 text-xs font-mono font-black text-slate-900 tracking-wider">
              {product.code}
            </p>
          </div>

          <div className="text-left bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-1.5">
            <p className="font-bold text-white text-sm">{product.name}</p>
            <p className="text-slate-400">
              Loại thiết bị: <strong className="text-slate-200">{product.category}</strong>
            </p>
            <p className="text-slate-400">
              Phòng ban / Vị trí: <strong className="text-blue-400">{product.department}</strong>
            </p>
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
