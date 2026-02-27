import { getDeviceSignature } from '@/security/fingerprint';

const DEVICE_CACHE_KEY = 'md_device_signature_v2';
const DEVICE_SEEN_KEY = 'md_device_first_seen_v1';

export interface DeviceFingerprint {
  id: string;
  firstSeenAt: string;
  lastSeenAt: string;
}

export const getEnhancedFingerprint = async (): Promise<DeviceFingerprint> => {
  const cached = localStorage.getItem(DEVICE_CACHE_KEY);
  const firstSeen = localStorage.getItem(DEVICE_SEEN_KEY);
  const now = new Date().toISOString();

  if (cached && firstSeen) {
    localStorage.setItem(DEVICE_SEEN_KEY, firstSeen);
    return {
      id: cached,
      firstSeenAt: firstSeen,
      lastSeenAt: now,
    };
  }

  const id = await getDeviceSignature();
  localStorage.setItem(DEVICE_CACHE_KEY, id);
  localStorage.setItem(DEVICE_SEEN_KEY, now);

  return {
    id,
    firstSeenAt: now,
    lastSeenAt: now,
  };
};
