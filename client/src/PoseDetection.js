import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';

const PoseDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [threshold, setThreshold] = useState(0.5);

  useEffect(() => {
    const setupBackend = async () => {
      try {
        await tf.setBackend('webgl'); // Set WebGL as the backend
        await tf.ready(); // Ensure TensorFlow.js is ready
        console.log('Using backend:', tf.getBackend());
      } catch (error) {
        console.error('Error in setupBackend:', error);
      }
    };

    const setupCamera = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      video.width = 640;
      video.height = 360;
      canvas.width = video.width;
      canvas.height = video.height;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 360 },
      });
      video.srcObject = stream;
      console.log('Camera setup complete');

      return new Promise((resolve) => {
        video.onloadedmetadata = () => {
          resolve(video);
        };
      });
    };

    const loadMoveNet = async () => {
      // Path to the local model files in public folder
      const modelUrl = '/models/movenet/model.json';
      const model = await tf.loadGraphModel(modelUrl);
      return poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        modelUrl,
      });
    };

    const drawKeypoints = (keypoints, ctx) => {
      keypoints.forEach((keypoint) => {
        if (keypoint.score > threshold) {
          ctx.beginPath();
          ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = 'yellow';
          ctx.fill();
        }
      });
    };

    const drawSkeleton = (keypoints, ctx) => {
      const adjacentKeyPoints = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet);
      adjacentKeyPoints.forEach(([i, j]) => {
        const kp1 = keypoints[i];
        const kp2 = keypoints[j];
        if (kp1.score > threshold && kp2.score > threshold) {
          ctx.beginPath();
          ctx.moveTo(kp1.x, kp1.y);
          ctx.lineTo(kp2.x, kp2.y);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'blue';
          ctx.stroke();
        }
      });
    };

    const detectPose = async (detector) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const poses = await detector.estimatePoses(video);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (poses.length > 0) {
        const keypoints = poses[0].keypoints;
        drawKeypoints(keypoints, ctx);
        drawSkeleton(keypoints, ctx);
      }
      requestAnimationFrame(() => detectPose(detector));
    };

    const main = async () => {
      try {
        await setupBackend();
        console.log('Backend setup complete');
        await setupCamera();
        videoRef.current.play();
        console.log('Video playing');
        const detector = await loadMoveNet();
        console.log('MoveNet loaded');
        detectPose(detector);
      } catch (error) {
        console.error('Error in main setup:', error);
      }
    };

    main();
  }, [threshold]);

  return (
    <div>
      <h1>MoveNet Pose Detection</h1>
      <video ref={videoRef} autoPlay playsInline width="640" height="360"></video>
      <canvas ref={canvasRef} width="640" height="360"></canvas>
      <div>
        <label htmlFor="threshold-slider">Threshold: <span>{threshold.toFixed(1)}</span></label>
        <input
          id="threshold-slider"
          type="range"
          min="0.1"
          max="1.0"
          step="0.02"
          value={threshold}
          onChange={(event) => setThreshold(parseFloat(event.target.value))}
        />
      </div>
    </div>
  );
};

export default PoseDetection;
