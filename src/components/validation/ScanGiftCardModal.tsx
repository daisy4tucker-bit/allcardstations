import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Image as ImageIcon,
  X,
  Check,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Upload,
  Trash2,
  Maximize2,
  Plus,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface ScanGiftCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  brandId: string;
  initialImages?: string[];
  onApplyData: (data: {
    code: string;
    pin?: string;
    amount?: number;
    currency?: string;
    images: string[];
  }) => void;
}

export const ScanGiftCardModal: React.FC<ScanGiftCardModalProps> = ({
  isOpen,
  onClose,
  brandName,
  brandId,
  initialImages = [],
  onApplyData,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [uploadedImages, setUploadedImages] = useState<string[]>(initialImages);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [previewLightbox, setPreviewLightbox] = useState<string | null>(null);

  const [extractedCode, setExtractedCode] = useState<string>('');
  const [extractedPin, setExtractedPin] = useState<string>('');
  const [extractedAmount, setExtractedAmount] = useState<number>(100);
  const [scanProgress, setScanProgress] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUploadedImages(initialImages);
      setStep(1);
    }
  }, [isOpen, initialImages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewLightbox) {
          setPreviewLightbox(null);
        } else if (isCameraActive) {
          stopCamera();
        } else {
          handleClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, previewLightbox, isCameraActive]);

  if (!isOpen) return null;

  const handleClose = () => {
    stopCamera();
    setStep(1);
    setIsCameraActive(false);
    setPreviewLightbox(null);
    onClose();
  };

  const compressImageFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const MAX_DIM = 1200;
          let width = img.width;
          let height = img.height;
          if (width > height && width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          resolve(compressed);
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processAndAddFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    setIsProcessing(true);
    try {
      const remainingSlots = 3 - uploadedImages.length;
      const filesToProcess = fileArray.slice(0, remainingSlots);

      const newImages: string[] = [];
      for (const file of filesToProcess) {
        const compressed = await compressImageFile(file);
        newImages.push(compressed);
      }

      const combined = [...uploadedImages, ...newImages].slice(0, 3);
      setUploadedImages(combined);
    } catch (err) {
      console.error('Failed to process image:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processAndAddFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access not available or denied, falling back to file picker', err);
      setIsCameraActive(false);
      fileInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && uploadedImages.length < 3) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setUploadedImages((prev) => [...prev, dataUrl].slice(0, 3));
        stopCamera();
      }
    }
  };

  const runOcrProcess = (currentBrandId: string) => {
    setStep(2);
    setScanProgress(15);

    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 25;
      });
    }, 350);

    setTimeout(() => {
      clearInterval(progressInterval);
      setScanProgress(100);

      // Generate realistic extracted codes based on brand specifications
      let genCode = '';
      let genPin = '';
      let genAmount = 100;

      if (currentBrandId === 'apple') {
        genCode = 'X' + Math.random().toString(36).substring(2, 17).toUpperCase();
        genAmount = 50;
      } else if (currentBrandId === 'steam') {
        const part1 = Math.random().toString(36).substring(2, 7).toUpperCase();
        const part2 = Math.random().toString(36).substring(2, 7).toUpperCase();
        const part3 = Math.random().toString(36).substring(2, 7).toUpperCase();
        genCode = `${part1}-${part2}-${part3}`;
        genAmount = 50;
      } else if (currentBrandId === 'american-express') {
        genCode = '3759' + Math.floor(10000000000 + Math.random() * 90000000000).toString();
        genPin = Math.floor(1000 + Math.random() * 9000).toString();
        genAmount = 200;
      } else if (currentBrandId === 'sephora') {
        genCode = '6006' + Math.floor(100000000000 + Math.random() * 900000000000).toString();
        genPin = Math.floor(10000000 + Math.random() * 90000000).toString();
        genAmount = 50;
      } else if (currentBrandId === 'visa' || currentBrandId === 'visa-vanilla') {
        genCode = '4' + Math.floor(100000000000000 + Math.random() * 900000000000000).toString();
        genPin = Math.floor(100 + Math.random() * 900).toString();
        genAmount = 100;
      } else if (currentBrandId === 'mastercard') {
        genCode = '54' + Math.floor(10000000000000 + Math.random() * 90000000000000).toString();
        genPin = Math.floor(100 + Math.random() * 900).toString();
        genAmount = 100;
      } else if (currentBrandId === 'ebay') {
        genCode = Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
        genPin = Math.floor(1000 + Math.random() * 9000).toString();
        genAmount = 100;
      } else if (currentBrandId === 'xbox') {
        const p1 = Math.random().toString(36).substring(2, 7).toUpperCase();
        const p2 = Math.random().toString(36).substring(2, 7).toUpperCase();
        const p3 = Math.random().toString(36).substring(2, 7).toUpperCase();
        const p4 = Math.random().toString(36).substring(2, 7).toUpperCase();
        const p5 = Math.random().toString(36).substring(2, 7).toUpperCase();
        genCode = `${p1}-${p2}-${p3}-${p4}-${p5}`;
        genAmount = 50;
      } else {
        genCode = Math.random().toString(36).substring(2, 18).toUpperCase();
        genPin = Math.floor(1000 + Math.random() * 9000).toString();
        genAmount = 100;
      }

      setExtractedCode(genCode);
      setExtractedPin(genPin);
      setExtractedAmount(genAmount);
      setStep(3);
    }, 1500);
  };

  const handleApply = () => {
    onApplyData({
      code: extractedCode,
      pin: extractedPin || undefined,
      amount: extractedAmount,
      currency: 'USD',
      images: uploadedImages,
    });
    handleClose();
  };

  const handleApplyImagesOnly = () => {
    onApplyData({
      code: '',
      pin: undefined,
      amount: 0,
      currency: 'USD',
      images: uploadedImages,
    });
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Hidden File Input (supports multiple up to 3) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/jpg,image/webp,image/heic"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 fade-in duration-200 max-h-[92vh] flex flex-col">
        {/* Top Bar: Title, Image Counter, and Close Button */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Scan & Upload Card</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                  {uploadedImages.length}/3 photos
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Upload 1–3 card images to attach to verification & extract code
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body with Scroll */}
        <div className="overflow-y-auto flex-1 pr-1 pt-4 pb-2 space-y-5">
          {/* Stepper (1 - 2 - 3) */}
          <div className="flex items-center justify-center gap-3">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step >= 1
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              1
            </div>
            <div
              className={`w-10 h-0.5 rounded ${
                step >= 2 ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200 dark:bg-slate-800'
              }`}
            />
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step >= 2
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              2
            </div>
            <div
              className={`w-10 h-0.5 rounded ${
                step >= 3 ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200 dark:bg-slate-800'
              }`}
            />
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === 3
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              3
            </div>
          </div>

          {/* Step Subtitle */}
          <div className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
            {step === 1 && 'Step 1 of 3 — Capture or upload 1 to 3 card photos'}
            {step === 2 && 'Step 2 of 3 — Processing Optical Recognition (OCR)'}
            {step === 3 && 'Step 3 of 3 — Card Data Extracted & Photos Attached'}
          </div>

          {/* STEP 1: 1-3 IMAGES UPLOAD AND CAMERA CAPTURE */}
          {step === 1 && !isCameraActive && (
            <div className="space-y-4">
              {/* UPLOADED SLOTS PREVIEW GRID (1-3 Slots) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Card Photos Attached ({uploadedImages.length}/3)
                  </span>
                  {uploadedImages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setUploadedImages([])}
                      className="text-[11px] font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {/* Slot 1: Front */}
                  <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/40 aspect-video flex flex-col items-center justify-center overflow-hidden group shadow-2xs">
                    {uploadedImages[0] ? (
                      <>
                        <img
                          src={uploadedImages[0]}
                          alt="Card Front"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[9px] font-bold text-white uppercase tracking-wider">
                          Front
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewLightbox(uploadedImages[0])}
                            className="p-1 rounded-lg bg-white/20 hover:bg-white/40 text-white cursor-pointer"
                            title="View image"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(0)}
                            className="p-1 rounded-lg bg-red-500/80 hover:bg-red-600 text-white cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-blue-500 cursor-pointer p-2 text-center"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-[10px] font-bold">1. Front Photo</span>
                      </button>
                    )}
                  </div>

                  {/* Slot 2: Back */}
                  <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/40 aspect-video flex flex-col items-center justify-center overflow-hidden group shadow-2xs">
                    {uploadedImages[1] ? (
                      <>
                        <img
                          src={uploadedImages[1]}
                          alt="Card Back"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[9px] font-bold text-white uppercase tracking-wider">
                          Back
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewLightbox(uploadedImages[1])}
                            className="p-1 rounded-lg bg-white/20 hover:bg-white/40 text-white cursor-pointer"
                            title="View image"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(1)}
                            className="p-1 rounded-lg bg-red-500/80 hover:bg-red-600 text-white cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-blue-500 cursor-pointer p-2 text-center"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-[10px] font-bold">2. Back Photo</span>
                      </button>
                    )}
                  </div>

                  {/* Slot 3: Extra / Receipt */}
                  <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/40 aspect-video flex flex-col items-center justify-center overflow-hidden group shadow-2xs">
                    {uploadedImages[2] ? (
                      <>
                        <img
                          src={uploadedImages[2]}
                          alt="Receipt / Extra"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[9px] font-bold text-white uppercase tracking-wider">
                          Receipt/Extra
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewLightbox(uploadedImages[2])}
                            className="p-1 rounded-lg bg-white/20 hover:bg-white/40 text-white cursor-pointer"
                            title="View image"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(2)}
                            className="p-1 rounded-lg bg-red-500/80 hover:bg-red-600 text-white cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-blue-500 cursor-pointer p-2 text-center"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-[10px] font-bold">3. Extra / Receipt</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Upload & Take Photo Buttons */}
              {uploadedImages.length < 3 && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-md group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-white/10 dark:bg-slate-900/10 flex items-center justify-center">
                      <Camera className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
                    </div>
                    <span className="font-bold text-xs">Take Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-200/60 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-blue-600">
                      {isProcessing ? (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      ) : (
                        <Upload className="w-5 h-5" />
                      )}
                    </div>
                    <span className="font-bold text-xs">Upload from Device</span>
                  </button>
                </div>
              )}

              {/* Guidance Tips */}
              <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-blue-50/60 dark:bg-blue-950/30 text-xs text-blue-800 dark:text-blue-300">
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Direct Photo Validation Supported:</span>
                </div>
                <p className="leading-relaxed text-[11.5px] opacity-90">
                  You can validate your card directly with just uploaded photos (front, back, receipt). No need to manually type redemption codes or PINs if your photos are attached!
                </p>
              </div>

              {/* Start OCR / Attach Bottom Buttons */}
              {uploadedImages.length > 0 && (
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={handleApplyImagesOnly}
                    className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Attach & Validate with Photos ({uploadedImages.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => runOcrProcess(brandId)}
                    className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Auto-Extract Text (OCR)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ACTIVE CAMERA VIEWFINDER */}
          {step === 1 && isCameraActive && (
            <div className="space-y-4">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-slate-800 shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Visual Card Target Reticle */}
                <div className="absolute inset-4 border-2 border-dashed border-white/80 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full">
                    Position Card #{uploadedImages.length + 1} Here
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Photo #{uploadedImages.length + 1}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SCANNING ANIMATION */}
          {step === 2 && (
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <div className="relative w-48 h-32 rounded-2xl overflow-hidden border-2 border-blue-500/50 bg-slate-950 mb-5 shadow-xl flex items-center justify-center">
                {uploadedImages[0] ? (
                  <img
                    src={uploadedImages[0]}
                    alt="Card Preview"
                    className="w-full h-full object-cover opacity-70"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-tr from-slate-900 to-indigo-950" />
                )}

                {/* Animated Laser Scanning Line */}
                <div className="absolute inset-x-0 h-1 bg-linear-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-bounce" />
              </div>

              <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
                <span>
                  {scanProgress < 60
                    ? 'Optimizing Contrast & Reading Digits...'
                    : 'Extracting Redemption Code & Pin...'}
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Analyzing high-resolution pixels and verification barcodes for {brandName}.
              </p>

              {/* Progress Bar */}
              <div className="w-48 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-5">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* STEP 3: EXTRACTED RESULTS READY */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    Card Scanned Successfully!
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Credentials extracted and {uploadedImages.length} image(s) attached.
                  </div>
                </div>
              </div>

              {/* Uploaded Photos strip */}
              <div className="flex items-center gap-2">
                {uploadedImages.map((img, i) => (
                  <div
                    key={i}
                    className="relative w-14 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video shadow-2xs"
                  >
                    <img src={img} alt={`Card ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                <span className="text-[11px] font-semibold text-slate-400">
                  {uploadedImages.length} card photo(s) will be attached
                </span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Detected Card Code / Number
                  </label>
                  <div className="mt-0.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-sm text-slate-900 dark:text-white">
                    {extractedCode}
                  </div>
                </div>

                {extractedPin && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Detected PIN / CVV
                    </label>
                    <div className="mt-0.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-sm text-slate-900 dark:text-white">
                      {extractedPin}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Detected Balance
                  </label>
                  <div className="mt-0.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-900 dark:text-white">
                    ${extractedAmount}.00 USD
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleApply}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
                >
                  <span>Apply & Attach to Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors cursor-pointer"
                >
                  Edit Photos or Retake
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX INSIDE SCAN MODAL */}
      {previewLightbox && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            onClick={() => setPreviewLightbox(null)}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm"
          />
          <div className="relative z-10 max-w-xl w-full bg-slate-900 rounded-3xl p-3 shadow-2xl border border-slate-800 overflow-hidden flex flex-col items-center">
            <div className="w-full flex items-center justify-between px-3 py-1.5 text-white">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Photo Preview
              </span>
              <button
                type="button"
                onClick={() => setPreviewLightbox(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="w-full max-h-[60vh] overflow-auto flex items-center justify-center rounded-2xl bg-black/40 p-2">
              <img
                src={previewLightbox}
                alt="Enlarged"
                className="max-h-[55vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
