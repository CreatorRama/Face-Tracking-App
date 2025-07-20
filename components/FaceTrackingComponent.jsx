'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as facemesh from '@tensorflow-models/facemesh';

export default function FaceTrackingComponent() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideos, setRecordedVideos] = useState([]);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const animationFrameRef = useRef(null);
  const modelRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize face detection
  useEffect(() => {
    const initFaceDetection = async () => {
      try {
        if (typeof window === 'undefined') return;

        // Use WebGL if available, fallback to CPU
        try {
          await tf.setBackend('webgl');
        } catch (webglErr) {
          console.warn('WebGL not available, falling back to CPU');
          await tf.setBackend('cpu');
        }

        await tf.ready();
        modelRef.current = await facemesh.load({
          maxFaces: 1, // Only detect one face for better performance
          refineLandmarks: false // Disable refined landmarks for better performance
        });

        streamRef.current = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        });

        videoRef.current.srcObject = streamRef.current;

        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            resolve();
          };
        });

        setIsInitialized(true);
        detectFaces();
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err.message.includes('WebGL') ?
          'WebGL is disabled in your browser. Please enable it for better performance.' :
          err.message);
      }
    };

    const detectFaces = async () => {
      if (!modelRef.current) return;

      try {
        const predictions = await modelRef.current.estimateFaces(videoRef.current);
        const ctx = canvasRef.current.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Draw video frame
        ctx.drawImage(videoRef.current, 0, 0);

        // Draw face landmarks if detected
        if (predictions.length > 0) {
          ctx.fillStyle = 'red';
          predictions[0].scaledMesh.forEach(([x, y]) => {
            ctx.fillRect(x, y, 2, 2);
          });
        }
      } catch (err) {
        console.error('Detection error:', err);
      }

      animationFrameRef.current = requestAnimationFrame(detectFaces);
    };

    initFaceDetection();

    const videos = JSON.parse(localStorage.getItem('R-V'))
    if (videos) {
      setRecordedVideos(videos)
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (modelRef.current) modelRef.current.dispose();
    };
  }, []);

  const startRecording = useCallback(() => {
    if (!canvasRef.current) return;

    // Lower the frame rate for recording to reduce lag
    const canvasStream = canvasRef.current.captureStream(15); // Reduced to 15fps
    recordedChunksRef.current = [];

    mediaRecorderRef.current = new MediaRecorder(canvasStream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 2500000 // 2.5 Mbps
    });

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunksRef.current.push(e.data);
      }
    };

    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });

      // Convert blob to base64 for storage
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;
        const newVideo = {
          data: base64data, // Store the actual data
          timestamp: new Date().toLocaleString()
        };

        setRecordedVideos(prev => [...prev, newVideo]);

        // Update localStorage
        const existingVideos = JSON.parse(localStorage.getItem('R-V') || '[]');
        localStorage.setItem('R-V', JSON.stringify([...existingVideos, newVideo]));
      };
    };
    // Don't collect data too frequently
    mediaRecorderRef.current.start(500); // Collect data every 500ms instead of 100ms
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const downloadRecording = useCallback((video, index) => {
    // Convert base64 data to Blob
    const byteString = atob(video.data.split(',')[1]);
    const mimeString = video.data.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([ab], { type: mimeString });

    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `face-tracking-${index}.webm`;
    document.body.appendChild(a);
    a.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }, []);
  
  const deleteRecording = useCallback((index) => {
    setRecordedVideos(prev => {
      const newVideos = [...prev];
      URL.revokeObjectURL(newVideos[index].url);
      return newVideos.filter((_, i) => i !== index);
    });
  }, []);

  return (
    <div className="flex flex-col items-center p-4">
      <div className="relative w-full max-w-2xl mb-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="rounded-lg shadow-lg w-full"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{ pointerEvents: 'none' }}
        />
      </div>

      {!isInitialized && !error && (
        <div className="text-center py-4">Initializing camera and face detection...</div>
      )}

      {error && (
        <div className="text-center py-4 text-red-500">
          Error: {error}. Please ensure camera access is allowed and WebGL is supported.
        </div>
      )}

      {isInitialized && (
        <div className="flex gap-4 mb-8">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              disabled={!!error}
            >
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Stop Recording
            </button>
          )}
        </div>
      )}

      {recordedVideos.length > 0 && (
        <div className="w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">Recorded Videos</h2>
          <div className="grid grid-cols-1 gap-4">
            {recordedVideos.map((video, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow">
                <video
                  controls
                  src={video.data}
                  className="w-full rounded mb-2"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{video.timestamp}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadRecording(video, index)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => deleteRecording(index)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}