import { Incident, IntakeAdvice, AuditVerificationResult, RcaResult, User, TimelineItem } from '../types';
import { toIncident, toTimelineItem, toAuditVerify, toAdvice, toRca } from './mappers';
import { demoBackendApi, isDemoMode, setDemoMode } from './demoBackend';

const ORIGIN = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, ''); // '' = same origin (Vite proxy)
export const API_BASE = `${ORIGIN}/api/v1`;



function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('iitsm_jwt');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errBody: any;
    try {
      errBody = await response.json();
    } catch {
      errBody = { detail: response.statusText };
    }
    const err = new Error(errBody.detail || errBody.title || `HTTP error ${response.status}`);
    (err as any).status = response.status;
    (err as any).body = errBody;
    throw err;
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

const realApi = {
  auth: {
    login: async (email: string, password = 'Bits@2026') => {
      return request<{ accessToken: string; refreshToken?: string; expiresInSeconds: number }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        }
      );
    },
    getMe: async (): Promise<User> => {
      return request<User>('/me');
    },
    issueStreamTicket: async () => {
      return request<{ ticket: string; expiresInSeconds: number }>('/auth/stream-ticket', {
        method: 'POST',
      });
    },
  },

  incidents: {
    list: async (params?: { status?: string; priority?: string; q?: string; limit?: number; parentId?: string; mine?: boolean }) => {
      const q = new URLSearchParams();
      if (params?.status) q.set('status', params.status);
      if (params?.priority) q.set('priority', params.priority);
      if (params?.q) q.set('q', params.q);
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.parentId) q.set('parentId', params.parentId);
      if (params?.mine) q.set('mine', 'true');
      const queryString = q.toString() ? `?${q.toString()}` : '';
      const raw = await request<any>(`/incidents${queryString}`);
      const items = Array.isArray(raw?.items) ? raw.items.map(toIncident) : (Array.isArray(raw) ? raw.map(toIncident) : []);
      return { items, nextCursor: raw?.nextCursor };
    },

    get: async (id: string): Promise<Incident> => {
      const raw = await request<any>(`/incidents/${id}`);
      return toIncident(raw);
    },

    create: async (data: {
      title: string;
      description: string;
      serviceCode?: string;
      serviceId?: string;
      urgency?: number;
      impactOverride?: number;
    }): Promise<Incident> => {
      const raw = await request<any>('/incidents', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return toIncident(raw);
    },

    command: async (id: string, command: string, envelope: Record<string, any> = {}): Promise<Incident> => {
      const raw = await request<any>(`/incidents/${id}/commands/${command}`, {
        method: 'POST',
        body: JSON.stringify(envelope),
      });
      return toIncident(raw);
    },

    timeline: async (id: string): Promise<TimelineItem[]> => {
      const raw = await request<any[]>(`/incidents/${id}/timeline`);
      return Array.isArray(raw) ? raw.map(toTimelineItem) : [];
    },

    ai: async (id: string) => {
      return request<any>(`/incidents/${id}/ai`);
    },

    rca: async (id: string): Promise<RcaResult> => {
      const raw = await request<any>(`/incidents/${id}/rca`);
      return toRca(raw);
    },


    pir: async (id: string) => {
      return request<any>(`/incidents/${id}/pir`, {
        method: 'POST',
      });
    },

    nlSearch: async (query: string) => {
      return request<any>('/incidents/nl-search', {
        method: 'POST',
        body: JSON.stringify({ query }),
      });
    },
  },

  intake: {
    getAdvice: async (data: { title: string; description: string; urgency?: number }): Promise<IntakeAdvice> => {
      const raw = await request<any>('/intake/advice', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return toAdvice(raw);
    },
  },


  admin: {
    getMetrics: async () => {
      return request<{
        totalVolume: number;
        activeMajorP1: number;
        slaCompliance: string;
        mttrMinutes: string;
        statusBreakdown: { status: string; count: number }[];
        priorityBreakdown: { priority: string; count: number }[];
      }>('/admin/metrics');
    },

    getAudit: async (params?: { incidentId?: string; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.incidentId) q.set('incidentId', params.incidentId);
      if (params?.limit) q.set('limit', String(params.limit));
      const queryString = q.toString() ? `?${q.toString()}` : '';
      return request<any[]>(`/admin/audit${queryString}`);
    },

    getSlaPolicies: async () => {
      return request<{
        id: string;
        tier: string;
        priority: string;
        responseTargetMin: number;
        resolutionTargetMin: number;
        mode: string;
      }[]>('/admin/sla-policies');
    },

    getServices: async () => {
      return request<any[]>('/admin/services');
    },

    getCategories: async () => {
      return request<any[]>('/admin/categories');
    },

    getUsers: async () => {
      return request<any[]>('/admin/users');
    },

    simulateStorm: async (data: { scenario?: string; reportCount?: number } = {}) => {
      return request<{
        scenario: string;
        totalInjected: number;
        masterCount: number;
        childCount: number;
        rootCandidateService: string;
      }>('/admin/simulate/storm', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    setDemoClock: async (scaleFactor: number) => {
      return request<{ scaleFactor: number; virtualNow: string }>('/admin/demo-clock', {
        method: 'POST',
        body: JSON.stringify({ scaleFactor }),
      });
    },

    verifyAuditLedger: async (): Promise<AuditVerificationResult> => {
      const raw = await request<any>('/admin/audit/verify', {
        method: 'POST',
      });
      return toAuditVerify(raw);
    },
  },

  services: {
    list: async () => {
      return request<{ id: string; code: string; name: string; tier: string }[]>('/services');
    },

    getTopology: async () => {
      return request<{
        nodes: {
          id: string;
          code: string;
          name: string;
          tier: string;
          team: string;
          openIncidents: number;
          status: 'HEALTHY' | 'DEGRADED' | 'OUTAGE';
        }[];
        edges: { from: string; to: string; type: string }[];
      }>('/services/topology');
    },
  },

  technicians: {
    list: async () => {
      return request<{
        id: string;
        name: string;
        supportTier: string;
        teamId: string;
        teamCode: string;
        loadPoints: number;
        capacity: number;
      }[]>('/technicians');
    },
  },
};

/**
 * Asks the Java backend whether it is there. Called once by main.tsx before the
 * app renders. When nothing answers (GitHub Pages, or localhost with the backend
 * switched off) the app switches to the in-browser backend instead of showing
 * errors. Any normal answer from /services (200, or 401 because no token was
 * sent) proves a Spring server is listening; a network error, a timeout, or a
 * 404/5xx from a static host or the Vite proxy means there is none.
 */
export async function probeBackend(timeoutMs = 2500): Promise<boolean> {
  if (isDemoMode()) return false;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}/services`, { signal: ctrl.signal });
    const isHtml = res.headers.get('content-type')?.includes('text/html');
    const alive = res.status < 500 && res.status !== 404 && !isHtml;
    if (!alive) setDemoMode(true);
    return alive;
  } catch {
    setDemoMode(true);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

// Every call picks the backend at call time, so the switch above takes effect
// without re-importing anything. The last ticket any call returned is kept on
// window.__izLast for the recording scripts in video_v4/.
function remember<T>(value: T): T {
  const v: any = value;
  if (v && typeof v === 'object' && typeof v.id === 'string' && typeof v.number === 'string') {
    (window as any).__izLast = v;
  }
  return value;
}
function pick(group: string, method: string) {
  return (...args: unknown[]) => {
    const source: any = isDemoMode() ? demoBackendApi : realApi;
    return Promise.resolve(source[group][method](...args)).then(remember);
  };
}
export const api = new Proxy({} as typeof realApi, {
  get: (_t, group: string) => new Proxy({}, { get: (_g, method: string) => pick(group, method) }),
});

