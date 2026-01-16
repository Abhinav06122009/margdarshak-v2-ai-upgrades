// src/security/biometrics.ts

/**
 * BEHAVIORAL BIOMETRICS ENGINE
 * Analyzes human vs. robot interaction patterns.
 */

const HISTORY_LIMIT = 50;
let keyPressTimings: number[] = [];
let mousePositions: { x: number; y: number }[] = [];
let isTracking = false;

export const startBioTracker = () => {
  if (isTracking) return;
  isTracking = true;

  // Track Keystrokes
  window.addEventListener('keydown', () => {
    const now = performance.now();
    keyPressTimings.push(now);
    if (keyPressTimings.length > HISTORY_LIMIT) keyPressTimings.shift();
  });

  // Track Mouse Path (sampling to avoid performance hit)
  let lastSample = 0;
  window.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastSample > 50) { // Sample every 50ms
      mousePositions.push({ x: e.clientX, y: e.clientY });
      if (mousePositions.length > HISTORY_LIMIT) mousePositions.shift();
      lastSample = now;
    }
  });
};

export const analyzeUserBehavior = () => {
  // 1. Typing Consistency Check (Bots type at exact intervals)
  let typingVariance = 100; // Default high variance (human)
  if (keyPressTimings.length > 5) {
    const intervals = [];
    for (let i = 1; i < keyPressTimings.length; i++) {
      intervals.push(keyPressTimings[i] - keyPressTimings[i - 1]);
    }
    // Calculate variance (standard deviation squared)
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    typingVariance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
  }

  // 2. Mouse Path Linearity (Bots move in straight lines)
  let linearityScore = 0; // 0 = curve, 1 = straight line
  if (mousePositions.length > 5) {
    let straightSegments = 0;
    for (let i = 2; i < mousePositions.length; i++) {
      const p1 = mousePositions[i - 2];
      const p2 = mousePositions[i - 1];
      const p3 = mousePositions[i];
      
      // Calculate triangle area formed by 3 points (0 area = straight line)
      const area = Math.abs(
        (p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2
      );
      if (area < 0.1) straightSegments++;
    }
    linearityScore = straightSegments / (mousePositions.length - 2);
  }

  // Verdict Logic
  // Variance < 5 means typing is inhumanly consistent
  // Linearity > 0.9 means mouse movement is inhumanly straight
  const isBotTyping = keyPressTimings.length > 5 && typingVariance < 5;
  const isBotMouse = mousePositions.length > 10 && linearityScore > 0.9;

  return {
    isHuman: !isBotTyping && !isBotMouse,
    details: {
      typingVariance: Math.round(typingVariance),
      mouseLinearity: linearityScore.toFixed(2),
      eventsRecorded: keyPressTimings.length + mousePositions.length
    }
  };
};