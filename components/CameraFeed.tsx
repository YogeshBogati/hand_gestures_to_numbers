
import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

export interface CameraFeedHandle {
  captureFrame: () => string | null;
}

export const CameraFeed = forwardRef<CameraFeedHandle>((props, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    captureFrame: () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas) {
        const context = canvas.getContext('2d');
        if (context) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Flip the context horizontally to match the mirrored video feed
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
          
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Reset the transform to normal before getting data URL
          context.setTransform(1, 0, 0, 1, 0, 0);

          return canvas.toDataURL('image/jpeg', 0.9);
        }
      }
      return null;
    },
  }));

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover transform scale-x-[-1]"
      />
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
});
