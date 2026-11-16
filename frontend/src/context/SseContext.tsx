import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { api, API_BASE } from '../services/api';

import { useAuth } from './AuthContext';
import { isDemoMode, demoEvents } from '../services/demoBackend';

export interface StormProgress {
  scenario: string;
  injectedCount: number;
  totalCount: number;
  masterCount: number;
  childCount: number;
}

interface SseContextType {
  isConnected: boolean;
  lastEvent: any;
  stormProgress: StormProgress | null;
  reconnect: () => void;
  clearStorm: () => void;
}

const SseContext = createContext<SseContextType | undefined>(undefined);

export const SseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, currentUser } = useAuth();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastEvent, setLastEvent] = useState<any>(null);
  const [stormProgress, setStormProgress] = useState<StormProgress | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryTimerRef = useRef<any>(null);

  const clearStorm = useCallback(() => {
    setStormProgress(null);
  }, []);

  const connect = useCallback(async () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (!token) {
      setIsConnected(false);
      return;
    }

    // In-browser backend: there is no server stream to open. Changes arrive
    // through the local event bus instead (see the effect below).
    if (isDemoMode()) {
      setIsConnected(true);
      return;
    }

    try {
      // 1. Fetch single-use 30-sec stream ticket
      const { ticket } = await api.auth.issueStreamTicket();
      if (!ticket) return;

      const es = new EventSource(`${API_BASE}/stream?ticket=${encodeURIComponent(ticket)}`);

      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
      };

      es.addEventListener('heartbeat', (e) => {
        try {
          const data = JSON.parse(e.data);
          setLastEvent({ type: 'heartbeat', data, timestamp: new Date().toISOString() });
        } catch {}
      });

      es.addEventListener('incident.created', (e) => {
        try {
          const data = JSON.parse(e.data);
          setLastEvent({ type: 'incident.created', data, timestamp: new Date().toISOString() });
        } catch {}
      });

      es.addEventListener('incident.updated', (e) => {
        try {
          const data = JSON.parse(e.data);
          setLastEvent({ type: 'incident.updated', data, timestamp: new Date().toISOString() });
        } catch {}
      });

      es.addEventListener('storm.progress', (e) => {
        try {
          const data = JSON.parse(e.data);
          setStormProgress(data);
          setLastEvent({ type: 'storm.progress', data, timestamp: new Date().toISOString() });
        } catch {}
      });

      es.onerror = () => {
        setIsConnected(false);
        es.close();
        // Exponential or 5s reconnect retry
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = setTimeout(() => {
          connect();
        }, 5000);
      };
    } catch (err) {
      setIsConnected(false);
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = setTimeout(() => {
        connect();
      }, 7000);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!isDemoMode()) return;
    return demoEvents.subscribe((evt) => {
      setLastEvent({ type: evt.type, data: evt.data, timestamp: new Date().toISOString() });
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      connect();
    }, 150);
    return () => {
      clearTimeout(timer);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      clearTimeout(retryTimerRef.current);
    };
  }, [connect, token]);

  return (
    <SseContext.Provider
      value={{
        isConnected,
        lastEvent,
        stormProgress,
        reconnect: connect,
        clearStorm,
      }}
    >
      {children}
    </SseContext.Provider>
  );
};

export const useSse = () => {
  const ctx = useContext(SseContext);
  if (!ctx) throw new Error('useSse must be used within an SseProvider');
  return ctx;
};
