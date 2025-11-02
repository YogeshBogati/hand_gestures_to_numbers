
import React, { useState, useRef, useCallback } from 'react';
import { CameraFeed, CameraFeedHandle } from './components/CameraFeed';
import { ResultDisplay } from './components/ResultDisplay';
import { recognizeHandGesture } from './services/geminiService';
import { CameraIcon, CaptureIcon, ErrorIcon, SpinnerIcon } from './components/Icons';

export default function App(): React.ReactElement {
  const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recognizedNumber, setRecognizedNumber] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cameraFeedRef = useRef<CameraFeedHandle>(null);

  const handleToggleCamera = () => {
    setIsCameraOn(prev => !prev);
    setError(null);
    setRecognizedNumber(null);
  };

  const handleCapture = useCallback(async () => {
    if (isLoading || !cameraFeedRef.current) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecognizedNumber(null);

    try {
      const imageDataUrl = cameraFeedRef.current.captureFrame();
      if (!imageDataUrl) {
        throw new Error('Failed to capture frame from camera.');
      }

      // remove `data:image/jpeg;base64,` prefix
      const base64Data = imageDataUrl.split(',')[1];
      const result = await recognizeHandGesture(base64Data);
      
      if (result !== null && result > 0) {
        setRecognizedNumber(result);
      } else {
        setRecognizedNumber(null);
        setError('Could not recognize a number. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white font-sans p-4 overflow-hidden">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-600 mb-2">
          Gesture to Number
        </h1>
        <p className="text-gray-400 mb-8 max-w-md">
          Use your camera to show a hand gesture representing a number from 1 to 10, and our AI will guess it.
        </p>

        <div className="relative w-full aspect-video bg-gray-800 rounded-2xl shadow-2xl shadow-indigo-500/20 overflow-hidden mb-8 border-2 border-gray-700">
          {isCameraOn ? (
            <CameraFeed ref={cameraFeedRef} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <CameraIcon className="w-16 h-16 text-gray-500 mb-4" />
              <p className="text-gray-400">Camera is off</p>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <ResultDisplay number={recognizedNumber} />
          </div>
        </div>
        
        {error && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center bg-red-500/20 text-red-300 px-4 py-2 rounded-lg border border-red-500/30">
                <ErrorIcon className="w-5 h-5 mr-2"/>
                <span>{error}</span>
            </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900/50 backdrop-blur-sm border-t border-gray-700/50">
        <div className="flex justify-center items-center gap-4">
          {!isCameraOn ? (
             <button
                onClick={handleToggleCamera}
                className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all duration-300 transform hover:scale-105 flex items-center"
              >
                <CameraIcon className="w-6 h-6 mr-2"/>
                Start Camera
            </button>
          ) : (
            <>
              <button
                onClick={handleCapture}
                disabled={isLoading}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:bg-gray-500 transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                aria-label="Capture Gesture"
              >
                 {isLoading ? <SpinnerIcon className="w-10 h-10 text-gray-800" /> : <CaptureIcon className="w-10 h-10 text-indigo-600" />}
              </button>
               <button
                  onClick={handleToggleCamera}
                  className="px-6 py-2 bg-red-600 text-white font-semibold rounded-full shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/50 transition-all duration-300"
                >
                  Stop Camera
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
