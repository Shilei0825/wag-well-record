import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, X, Check, RotateCcw, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface CheckInCameraProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export function CheckInCamera({ onCapture, onClose }: CheckInCameraProps) {
  const { language } = useLanguage();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError(language === 'zh' ? '无法访问摄像头' : 'Cannot access camera');
    } finally {
      setIsLoading(false);
    }
  }, [facingMode, stream, language]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (facingMode) {
      startCamera();
    }
  }, [facingMode]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageDataUrl);
  };

  const retake = () => {
    setCapturedImage(null);
    setValidationError(null);
  };

  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const confirm = async () => {
    if (!capturedImage) return;
    
    setIsValidating(true);
    setValidationError(null);
    
    try {
      // Validate with AI that the image contains a pet
      const { data: validationResult, error: validationError } = await supabase.functions.invoke('validate-pet-photo', {
        body: { imageBase64: capturedImage }
      });
      
      if (validationError) {
        console.error('Validation error:', validationError);
        // Fail-safe: proceed if validation service is unavailable
      } else if (validationResult && !validationResult.isPet) {
        setValidationError(
          language === 'zh' 
            ? `未检测到宠物: ${validationResult.reason || '请拍一张包含宠物的照片'}` 
            : `No pet detected: ${validationResult.reason || 'Please take a photo with your pet'}`
        );
        setIsValidating(false);
        return;
      }
      
      // Convert data URL to File
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], `checkin-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      onCapture(file);
    } catch (error) {
      console.error('Validation error:', error);
      // Fail-safe: proceed even if validation fails
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], `checkin-${Date.now()}.jpg`, { type: 'image/jpeg' });
      onCapture(file);
    } finally {
      setIsValidating(false);
    }
  };

  const switchCamera = async () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    await startCamera();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </Button>
        
        <h2 className="text-white font-medium">
          {language === 'zh' ? '拍照打卡' : 'Check In Photo'}
        </h2>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={switchCamera}
          className="text-white hover:bg-white/20"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>

      {/* Camera/Preview Area */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {capturedImage ? (
            <motion.img
              key="preview"
              src={capturedImage}
              alt="Preview"
              className="w-full h-full object-cover"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            />
          ) : (
            <motion.video
              key="video"
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              onLoadedMetadata={() => setIsLoading(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
        
        {isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white">
              {language === 'zh' ? '加载摄像头...' : 'Loading camera...'}
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center text-white p-4">
              <p className="mb-4">{error}</p>
              <Button onClick={startCamera} variant="outline">
                {language === 'zh' ? '重试' : 'Retry'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Validation Error */}
      {validationError && (
        <div className="absolute bottom-32 left-0 right-0 z-20 px-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/90 text-destructive-foreground rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{validationError}</p>
          </motion.div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-8 pb-12">
        <AnimatePresence mode="wait">
          {capturedImage ? (
            <motion.div
              key="confirm"
              className="flex flex-col items-center gap-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
            >
              {isValidating && (
                <div className="flex items-center gap-2 text-white mb-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">
                    {language === 'zh' ? '正在验证照片...' : 'Validating photo...'}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-center gap-8">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={retake}
                  disabled={isValidating}
                  className="rounded-full w-16 h-16 bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <RotateCcw className="h-6 w-6" />
                </Button>
                <Button
                  size="lg"
                  onClick={confirm}
                  disabled={isValidating}
                  className="rounded-full w-20 h-20 bg-primary hover:bg-primary/90"
                >
                  {isValidating ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <Check className="h-8 w-8" />
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="capture"
              className="flex items-center justify-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
            >
              <Button
                size="lg"
                onClick={capturePhoto}
                disabled={isLoading || !!error}
                className="rounded-full w-20 h-20 bg-white hover:bg-white/90 text-black"
              >
                <Camera className="h-8 w-8" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
