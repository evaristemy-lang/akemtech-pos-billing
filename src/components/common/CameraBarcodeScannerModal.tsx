import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  RefreshCw,
  Zap,
  ZapOff,
  CheckCircle2,
  AlertCircle,
  Barcode,
  Search,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { playHardwareBeep } from '../../utils/printerEngine';
import { formatFCFA } from '../../utils/formatters';
import { Product } from '../../types';

interface CameraBarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductScanned: (product: Product) => void;
}

export const CameraBarcodeScannerModal: React.FC<CameraBarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onProductScanned,
}) => {
  const { products, language } = useApp();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [lastDetectedProduct, setLastDetectedProduct] = useState<Product | null>(null);
  const [manualCode, setManualCode] = useState('');

  // Start camera stream when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setErrorMessage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          language === 'fr'
            ? 'La caméra n’est pas supportée dans ce navigateur.'
            : 'Camera API is not supported in this browser.'
        );
      }

      const constraints: MediaStreamConstraints = {
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
        await videoRef.current.play();
      }

      setHasCameraPermission(true);

      // Check for torch capability
      const track = stream.getVideoTracks()[0];
      const capabilities: any = track.getCapabilities ? track.getCapabilities() : {};
      if (capabilities.torch) {
        setHasTorch(true);
      } else {
        setHasTorch(false);
      }

      // Start barcode detection loop
      startBarcodeScanning(track);
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setHasCameraPermission(false);
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? (language === 'fr' ? 'Accès à la caméra refusé. Veuillez autoriser l’appareil photo.' : 'Camera access denied. Please grant permission.')
          : (err.message || 'Impossible d’ouvrir la caméra.')
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Barcode Detection loop with BarcodeDetector API if available
  const startBarcodeScanning = async (videoTrack: MediaStreamTrack) => {
    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
        });

        const scanInterval = setInterval(async () => {
          if (!videoRef.current || !streamRef.current) {
            clearInterval(scanInterval);
            return;
          }

          try {
            if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const detectedRawValue = barcodes[0].rawValue;
                handleCodeScanned(detectedRawValue);
              }
            }
          } catch {
            // Ignore frame detection transient errors
          }
        }, 300);

        return () => clearInterval(scanInterval);
      } catch {
        // Fallback to manual input or simulated scan
      }
    }
  };

  const handleCodeScanned = (code: string) => {
    const clean = code.trim().toLowerCase();
    const found = products.find(
      p =>
        p.barcode.toLowerCase() === clean ||
        p.sku.toLowerCase() === clean ||
        p.name.toLowerCase().includes(clean)
    );

    if (found) {
      playHardwareBeep('scan');
      setLastDetectedProduct(found);
      onProductScanned(found);
    } else {
      playHardwareBeep('error');
      setErrorMessage(
        language === 'fr'
          ? `Code-barres [${code}] non trouvé dans le catalogue.`
          : `Barcode [${code}] not found in inventory.`
      );
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleManualLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleCodeScanned(manualCode.trim());
    setManualCode('');
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      await (track as any).applyConstraints({
        advanced: [{ torch: !torchEnabled }],
      });
      setTorchEnabled(!torchEnabled);
    } catch {
      // Not supported
    }
  };

  const toggleCameraFacing = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs no-print text-xs">
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">
                {language === 'fr' ? 'Scanner Caméra Code-Barres / QR' : 'Camera Barcode & QR Scanner'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {language === 'fr'
                  ? 'Compatible caméra smartphone (Android, iOS) & webcam PC'
                  : 'Smartphone & PC webcam optical scanner'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Viewport & Scanning Reticle */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] overflow-hidden">
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover max-h-[360px]"
          />

          {/* Holographic Aiming Reticle */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
            <div className="relative w-64 h-48 border-2 border-teal-400/80 rounded-2xl shadow-[0_0_20px_rgba(45,212,191,0.25)] flex items-center justify-center">
              {/* Corner Accents */}
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-teal-400 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-teal-400 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-teal-400 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-teal-400 rounded-br-lg" />

              {/* Scanning Red Laser Beam */}
              <div className="absolute left-2 right-2 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-scan-laser" />

              <span className="text-[10px] font-mono text-teal-300 bg-slate-900/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {language === 'fr' ? 'Aligner le code' : 'Align Barcode / QR'}
              </span>
            </div>
          </div>

          {/* Quick Hardware Controls Overlay */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {hasTorch && (
              <button
                type="button"
                onClick={toggleTorch}
                className={`p-2 rounded-xl backdrop-blur-md transition ${
                  torchEnabled ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-black/50 text-white'
                }`}
                title="Torche"
              >
                {torchEnabled ? <Zap className="h-4 w-4" /> : <ZapOff className="h-4 w-4" />}
              </button>
            )}

            <button
              type="button"
              onClick={toggleCameraFacing}
              className="p-2 rounded-xl bg-black/50 backdrop-blur-md text-white hover:bg-black/70"
              title="Changer de caméra"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {/* Detection or Error Banner */}
          {errorMessage && (
            <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-red-950/90 border border-red-500/50 p-2.5 text-xs text-red-200 flex items-center gap-2 backdrop-blur-md">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {lastDetectedProduct && !errorMessage && (
            <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-teal-950/90 border border-teal-500/50 p-2.5 text-xs text-teal-200 flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-400" />
                <div>
                  <p className="font-bold text-white">{lastDetectedProduct.name}</p>
                  <p className="text-[10px] text-teal-300 font-mono">
                    {formatFCFA(lastDetectedProduct.sellingPrice, language)} • Ajouté au panier !
                  </p>
                </div>
              </div>
              <span className="rounded-lg bg-teal-500 px-2 py-0.5 text-[10px] font-black text-slate-950">
                +1
              </span>
            </div>
          )}
        </div>

        {/* Quick Product Simulation / Manual Barcode Input */}
        <div className="border-t border-slate-800 bg-slate-900/90 p-4 space-y-3">
          <form onSubmit={handleManualLookup} className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                placeholder={
                  language === 'fr'
                    ? 'Ou saisir le code-barres / SKU (ex: 6181100234, CEM-01)...'
                    : 'Or type barcode / SKU manually...'
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-800 pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-500 outline-none focus:border-teal-400"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-teal-500 px-4 py-2 font-bold text-slate-950 hover:bg-teal-400 transition"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Barcode Demo Pickers */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              {language === 'fr' ? 'Codes-barres fréquents à scanner :' : 'Fast barcode triggers :'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {products.slice(0, 5).map(prod => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => handleCodeScanned(prod.barcode)}
                  className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:border-teal-500 hover:text-white transition"
                >
                  <Barcode className="h-3 w-3 text-teal-400" />
                  <span className="truncate max-w-[120px]">{prod.name}</span>
                  <span className="font-mono text-[9px] text-slate-500">({prod.barcode})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 px-5 py-3 text-[11px] text-slate-400">
          <span>{products.length} articles disponibles en rayon</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-1.5 font-bold text-white hover:bg-slate-700"
          >
            {language === 'fr' ? 'Fermer' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
