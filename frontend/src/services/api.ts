import { Incident, IntakeAdvice, AuditVerificationResult, RcaResult, User } from '../types';

const API_BASE = '/api/v1';

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

export const api = {
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
    list: async (params?: { status?: string; priority?: string; q?: string; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.status) q.set('status', params.status);
      if (params?.priority) q.set('priority', params.priority);
      if (params?.q) q.set('q', params.q);
      if (params?.limit) q.set('limit', String(params.limit));
      const queryString = q.toString() ? `?${q.toString()}` : '';
      return request<{ items: Incident[]; nextCursor?: string }>(`/incidents${queryString}`);
    },

    get: async (id: string): Promise<Incident> => {
      return request<Incident>(`/incidents/${id}`);
    },

    create: async (data: {
      title: string;
      description: string;
      serviceId?: string;
      urgency?: number;
      impactOverride?: number;
    }): Promise<Incident> => {
      return request<Incident>('/incidents', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    command: async (id: string, command: string, envelope: Record<string, any> = {}): Promise<Incident> => {
      return request<Incident>(`/incidents/${id}/commands/${command}`, {
        method: 'POST',
        body: JSON.stringify(envelope),
      });
    },

    timeline: async (id: string) => {
      return request<any[]>(`/incidents/${id}/timeline`);
    },

    ai: async (id: string) => {
      return request<any>(`/incidents/${id}/ai`);
    },

    rca: async (id: string): Promise<RcaResult> => {
      return request<RcaResult>(`/incidents/${id}/rca`);
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
      return request<IntakeAdvice>('/intake/advice', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  admin: {
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
      return request<AuditVerificationResult>('/admin/audit/verify', {
        method: 'POST',
      });
    },
  },
};
