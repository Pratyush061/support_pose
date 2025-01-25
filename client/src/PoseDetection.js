import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';

const PoseDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [threshold, setThreshold] = useState(0.5);
  const [error, setError] = useState(null);

  useEffect(() => {
    let detector = null;
    let animationFrameId = null;

    const setupBackend = async () => {
      try {
        await tf.setBackend('webgl');
        await tf.ready();
        console.log('Backend set to:', tf.getBackend());
      } catch (err) {
        setError('Backend setup failed');
        console.error('Backend setup error:', err);
      }
    };

    const setupCamera = async () => {
      try {
        const video = videoRef.current;
        video.width = 640;
        video.height = 360;
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 360 },
        });
        video.srcObject = stream;
        return new Promise((resolve) => {
          video.onloadedmetadata = () => resolve(video);
        });
      } catch (err) {
        setError('Camera access failed');
        console.error('Camera setup error:', err);
        throw err;
      }
    };

    const loadMoveNet = async () => {
      try {
        const model = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
        );
        await model.estimatePoses(tf.zeros([1, 256, 256, 3]));
        return model;
      } catch (err) {
        setError('Model loading failed');
        console.error('Model load error:', err);
        throw err;
      }
    };

    const detectPose = async (detector) => {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        const poses = await detector.estimatePoses(video);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        if (poses.length > 0) {
          poses[0].keypoints.forEach((keypoint) => {
            if (keypoint.score > threshold) {
              ctx.beginPath();
              ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
              ctx.fillStyle = 'yellow';
              ctx.fill();
            }
          });
        }
        
        animationFrameId = requestAnimationFrame(() => detectPose(detector));
      } catch (err) {
        setError('Pose detection failed');
        console.error('Pose detection error:', err);
      }
    };

    const main = async () => {
      try {
        await setupBackend();
        const video = await setupCamera();
        video.play();
        detector = await loadMoveNet();
        detectPose(detector);
      } catch (err) {
        setError('Initialization failed');
        console.error('Main setup error:', err);
      }
    };

    main();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (videoRef.current) {
        const tracks = videoRef.current.srcObject?.getTracks();
        tracks?.forEach(track => track.stop());
      }
    };
  }, [threshold]);

  if (error) {
    return (
      <div>
        <h2>Error: {error}</h2>
        <p>Please check your camera access and browser compatibility.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>MoveNet Pose Detection</h1>
      <video ref={videoRef} autoPlay playsInline></video>
      <canvas ref={canvasRef} width={640} height={360}></canvas>
      <div>
        <label>
          Threshold: <span>{threshold}</span>
        </label>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.01"
          value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};

export default PoseDetection;
