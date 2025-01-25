import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-indexeddb';
import * as poseDetection from '@tensorflow-models/pose-detection';

const PoseDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [threshold, setThreshold] = useState(0.5);

  useEffect(() => {
    const setupBackend = async () => {
      try {
        // Try WebGL first, fallback to indexeddb if needed
        if (!await tf.setBackend('webgl')) {
          await tf.setBackend('indexeddb');
        }
        await tf.ready();
        console.log('Backend set to:', tf.getBackend());
      } catch (error) {
        console.error('Error in setupBackend:', error);
      }
    };

    const setupCamera = async () => {
      const video = videoRef.current;
      video.width = 640;
      video.height = 360;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 360 },
      });
      video.srcObject = stream;
      return new Promise((resolve) => {
        video.onloadedmetadata = () => {
          resolve(video);
        };
      });
    };

    const loadMoveNet = async () => {
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        }
      );
      // Warmup model with correct tensor shape
      await detector.estimatePoses(tf.zeros([1, 256, 256, 3]));
      console.log('MoveNet model warmed up');
      return detector;
    };

    const detectPose = async (detector) => {
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
      requestAnimationFrame(() => detectPose(detector));
    };

    const main = async () => {
      try {
        await setupBackend();
        const video = await setupCamera();
        video.play();
        const detector = await loadMoveNet();
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
