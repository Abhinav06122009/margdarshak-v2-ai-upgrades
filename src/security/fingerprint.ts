// src/security/fingerprint.ts

/**
 * ADVANCED DEVICE FINGERPRINTING
 * Generates a high-entropy unique ID based on hardware and browser traits.
 */

export const getDeviceSignature = async (): Promise<string> => {
  try {
    // 1. Gather Entropy Sources
    const components = [
      navigator.userAgent,
      navigator.language,
      new Date().getTimezoneOffset(), // Timezone
      screen.colorDepth,
      navigator.hardwareConcurrency || 'unknown',
      (navigator as any).deviceMemory || 'unknown',
      `${screen.width}x${screen.height}`,
      `${screen.availWidth}x${screen.availHeight}`,
      'sessionStorage' in window ? '1' : '0',
      'localStorage' in window ? '1' : '0',
      'indexedDB' in window ? '1' : '0'
    ];

    // 2. WebGL Fingerprint (Graphics Card Info)
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const vendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          components.push(`${vendor}::${renderer}`);
        }
      }
    } catch (e) {
      components.push('webgl-error');
    }

    // 3. Canvas Fingerprint (Rendering Engine Artifacts)
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = "14px 'Arial'";
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('Margdarshak_Secure_v2', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('Entropy_Check', 4, 17);
        components.push(canvas.toDataURL().slice(-64)); // Add last 64 chars of hash
      }
    } catch (e) {
      components.push('canvas-error');
    }

    // 4. Hash the combined string
    const rawString = components.join('||');
    const msgBuffer = new TextEncoder().encode(rawString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  } catch (err) {
    console.warn('Fingerprint generation failed, utilizing fallback.');
    return 'fallback-id-' + Date.now() + '-' + Math.random();
  }
};