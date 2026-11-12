import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  X, 
  Camera, 
  Upload, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  ScanLine, 
  SwitchCamera, 
  Keyboard 
} from "lucide-react";
import { toast } from "sonner";

export default function MobileQrScannerModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [hasCamera, setHasCamera] = useState(true);
  const [cameraLoading, setCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState("environment"); // "environment" (rear) or "user" (front)
  const [manualCode, setManualCode] = useState("");
  const [mode, setMode] = useState("camera"); // 'camera' | 'manual'
  const isScanningRef = useRef(false);

  // Khởi động Camera khi modal mở
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    if (mode === "camera") {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, mode]);

  const stopCamera = () => {
    isScanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async () => {
    stopCamera();
    setCameraLoading(true);
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCamera(false);
      setCameraError("Trình duyệt không hỗ trợ truy cập Camera trực tiếp. Bạn có thể chụp ảnh hoặc nhập mã tay.");
      setCameraLoading(false);
      setMode("manual");
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true"); // Quan trọng cho iOS Safari
        await videoRef.current.play();
        setCameraLoading(false);
        isScanningRef.current = true;
        startBarcodeDetection();
      }
    } catch (err) {
      console.warn("Không mở được camera:", err);
      setCameraError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Bạn chưa cấp quyền truy cập Camera. Vui lòng cho phép Camera trong cài đặt trình duyệt hoặc nhập mã thủ công."
          : "Không tìm thấy hoặc không khởi động được Camera sau của máy."
      );
      setCameraLoading(false);
    }
  };

  // Vòng lặp nhận diện QR Code tự động bằng BarcodeDetector API chuẩn Web
  const startBarcodeDetection = () => {
    if (!("BarcodeDetector" in window)) {
      return; // BarcodeDetector không có sẵn, người dùng có thể chụp ảnh tải lên
    }

    try {
      const barcodeDetector = new window.BarcodeDetector({ formats: ["qr_code", "code_128", "ean_13"] });

      const scanLoop = async () => {
        if (!isScanningRef.current || !videoRef.current) return;

        if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const rawValue = barcodes[0].rawValue;
              handleDetectedCode(rawValue);
              return;
            }
          } catch (e) {
            // Không nhận diện được ở frame này, tiếp tục frame sau
          }
        }
        if (isScanningRef.current) {
          requestAnimationFrame(scanLoop);
        }
      };

      requestAnimationFrame(scanLoop);
    } catch (e) {
      console.warn("Lỗi BarcodeDetector:", e);
    }
  };

  // Xử lý mã QR sau khi quét trúng
  const handleDetectedCode = (code) => {
    if (!code) return;
    stopCamera();

    let cleanCode = code.trim();
    // Nếu là URL dạng https://domain/scan/TB-001 hoặc /scan/TB-001
    const match = cleanCode.match(/\/scan\/([A-Za-z0-9_-]+)/i);
    if (match && match[1]) {
      cleanCode = match[1];
    }

    toast.success(`Đã quét thành công mã [${cleanCode}]!`);
    onClose();
    navigate(`/scan/${encodeURIComponent(cleanCode)}`);
  };

  // Chuyển đổi camera trước/sau
  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Xử lý khi người dùng chọn ảnh chụp QR từ máy
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if ("BarcodeDetector" in window) {
      const img = new Image();
      img.onload = async () => {
        try {
          const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
          const barcodes = await detector.detect(img);
          if (barcodes.length > 0) {
            handleDetectedCode(barcodes[0].rawValue);
          } else {
            toast.warning("Không tìm thấy mã QR trong ảnh này. Vui lòng chụp rõ hơn hoặc nhập mã!");
          }
        } catch (err) {
          toast.error("Lỗi khi đọc mã từ ảnh.");
        }
      };
      img.src = URL.createObjectURL(file);
    } else {
      toast.info("Vui lòng nhập trực tiếp mã định danh in trên thiết bị.");
      setMode("manual");
    }
  };

  // Submit nhập mã bằng tay
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      toast.warning("Vui lòng nhập mã thiết bị (Ví dụ: TB-001)");
      return;
    }
    handleDetectedCode(manualCode.trim());
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full sm:max-w-md bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-800 text-white overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-slideUp sm:animate-scaleUp pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <ScanLine className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">Quét Mã QR Thiết Bị</h3>
              <p className="text-[11px] text-slate-400">Tra cứu nhanh xe tập lái & phòng máy</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chuyển đổi chế độ: Camera vs Nhập tay */}
        <div className="p-3 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("camera")}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              mode === "camera"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Ống kính Camera</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("manual")}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              mode === "manual"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Nhập mã tay</span>
          </button>
        </div>

        {/* Nội dung chính */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto">
          {mode === "camera" ? (
            <div className="space-y-4">
              {/* Khung Camera Viewfinder */}
              <div className="relative aspect-square w-full max-w-[320px] mx-auto rounded-3xl overflow-hidden bg-black border-2 border-blue-500/50 shadow-2xl flex items-center justify-center">
                {cameraLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-400 p-4 text-center z-10">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                    <p className="text-xs">Đang khởi động Camera...</p>
                  </div>
                )}

                {cameraError ? (
                  <div className="p-6 text-center text-slate-300 space-y-3 z-10">
                    <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                    <p className="text-xs leading-relaxed text-rose-300">{cameraError}</p>
                    <button
                      onClick={() => setMode("manual")}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition"
                    >
                      Chuyển sang nhập mã tay
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />

                    {/* Khung ngắm quét QR (Reticle overlay) */}
                    <div className="absolute inset-8 border-2 border-dashed border-white/60 rounded-2xl pointer-events-none flex items-center justify-center">
                      <div className="w-full h-0.5 bg-red-500/80 shadow-[0_0_8px_#ef4444] animate-pulse" />
                    </div>

                    {/* Nút lật camera trước / sau */}
                    <button
                      onClick={handleFlipCamera}
                      title="Đổi camera trước/sau"
                      className="absolute bottom-3 right-3 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur-md border border-slate-700 transition"
                    >
                      <SwitchCamera className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              <p className="text-center text-xs text-slate-400">
                Căn chỉnh mã QR dán trên thân máy hoặc trong xe vào giữa khung ngắm.
              </p>

              {/* Tải ảnh có sẵn từ máy */}
              <div className="pt-2 text-center">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl cursor-pointer transition border border-slate-700">
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>Chọn ảnh QR từ thư viện máy</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            /* Chế độ nhập mã bằng tay */
            <form onSubmit={handleManualSubmit} className="space-y-4 py-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-blue-950 text-blue-400 flex items-center justify-center mx-auto border border-blue-800">
                  <Keyboard className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Nhập Mã Định Danh Thiết Bị</h4>
                <p className="text-xs text-slate-400">Mã thường được in ngay bên dưới tem mã QR</p>
              </div>

              <div>
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Ví dụ: TB-001, DAT-09, CB-02..."
                  autoFocus
                  className="w-full px-4 py-3.5 bg-slate-950 text-white rounded-2xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center uppercase tracking-wider text-base font-bold placeholder-slate-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Tra cứu thông tin ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
