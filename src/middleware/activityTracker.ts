import { logUserActivity } from '@/lib/security/securityService';

export const trackActivity = async (userId: string, activityType: string, metadata?: Record<string, any>) => {
  await logUserActivity(userId, activityType, metadata);
};

export const createTrackedFetch = (userId: string) => {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const start = performance.now();
    const response = await fetch(input, init);
    const duration = Math.round(performance.now() - start);

    await logUserActivity(userId, 'api_request', {
      url: typeof input === 'string' ? input : input.toString(),
      status: response.status,
      duration,
    });

    return response;
  };
};
