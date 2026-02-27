export interface IpDetails {
  ip: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  countryCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
  org?: string | null;
  isProxy?: boolean;
}

const IP_CACHE_KEY = 'md_secure_ip_cache_v1';
const CACHE_TTL = 5 * 60 * 1000;

const toCache = (data: IpDetails) => ({
  data,
  expiresAt: Date.now() + CACHE_TTL,
});

const fromCache = (): IpDetails | null => {
  const raw = localStorage.getItem(IP_CACHE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
      return parsed.data as IpDetails;
    }
  } catch (error) {
    console.warn('Failed to parse IP cache', error);
  }
  return null;
};

const detectProxy = (org?: string | null, isp?: string | null) => {
  const combined = `${org || ''} ${isp || ''}`.toLowerCase();
  return combined.includes('vpn') || combined.includes('proxy') || combined.includes('tor');
};

export const fetchIpDetails = async (): Promise<IpDetails> => {
  const cached = fromCache();
  if (cached) return cached;

  try {
    const response = await fetch('https://ipapi.co/json/', { credentials: 'omit' });
    if (!response.ok) throw new Error('Failed to resolve IP details');
    const payload = await response.json();

    const details: IpDetails = {
      ip: payload.ip || null,
      city: payload.city || null,
      region: payload.region || null,
      country: payload.country_name || null,
      countryCode: payload.country_code || null,
      latitude: payload.latitude ?? null,
      longitude: payload.longitude ?? null,
      timezone: payload.timezone || null,
      org: payload.org || null,
      isProxy: detectProxy(payload.org, payload.isp),
    };

    localStorage.setItem(IP_CACHE_KEY, JSON.stringify(toCache(details)));
    return details;
  } catch (error) {
    console.error('IP lookup failed', error);
    return { ip: null };
  }
};
