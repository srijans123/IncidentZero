import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api } from '../services/api';

export interface PredefinedUser {
  id: string;
  email: string;
  name: string;
  role: 'EMPLOYEE' | 'TECHNICIAN' | 'ADMINISTRATOR';
  supportTier?: 'L1' | 'SENIOR' | 'TEAM_LEAD';
  teamId?: string;
  teamName: string;
  department: string;
  avatar: string;
}

export const SEEDED_USERS: PredefinedUser[] = [
  {
    id: '019299a0-0000-7000-8000-000000000001',
    email: 'emp@bits.campus',
    name: 'Aarav Sharma',
    role: 'EMPLOYEE',
    teamName: 'Undergraduate',
    department: 'CSIS',
    avatar: '👩‍🎓',
  },
  {
    id: '019299a0-0000-7000-8000-000000000002',
    email: 'diya@bits.campus',
    name: 'Diya Nair',
    role: 'EMPLOYEE',
    teamName: 'Postgraduate',
    department: 'EEE',
    avatar: '🔬',
  },
  {
    id: '019299a0-0000-7000-8000-000000000003',
    email: 'tech.vikram@bits.campus',
    name: 'Vikram Rao',
    role: 'TECHNICIAN',
    supportTier: 'L1',
    teamName: 'Campus Service Desk',
    department: 'CCIT',
    avatar: '🛠️',
  },
  {
    id: '019299a0-0000-7000-8000-000000000004',
    email: 'lead.priya@bits.campus',
    name: 'Priya Menon',
    role: 'TECHNICIAN',
    supportTier: 'TEAM_LEAD',
    teamName: 'Applications Team',
    department: 'CCIT',
    avatar: '👩‍💼',
  },
  {
    id: '019299a0-0000-7000-8000-000000000005',
    email: 'tech.rohan@bits.campus',
    name: 'Rohan Kulkarni',
    role: 'TECHNICIAN',
    supportTier: 'SENIOR',
    teamName: 'Infrastructure & ERP',
    department: 'CCIT',
    avatar: '👨‍💻',
  },
  {
    id: '019299a0-0000-7000-8000-000000000006',
    email: 'tech.ananya@bits.campus',
    name: 'Ananya Iyer',
    role: 'TECHNICIAN',
    supportTier: 'L1',
    teamName: 'Network Ops (NOC)',
    department: 'CCIT',
    avatar: '📡',
  },
  {
    id: '019299a0-0000-7000-8000-000000000007',
    email: 'admin@bits.campus',
    name: 'Suresh Deshmukh',
    role: 'ADMINISTRATOR',
    teamName: 'IT Governance',
    department: 'CCIT',
    avatar: '⚡',
  },
  {
    id: '019299a0-0000-7000-8000-000000000008',
    email: 'manager@bits.campus',
    name: 'Prof. Kavita Krishnan',
    role: 'ADMINISTRATOR',
    teamName: 'IT Service Delivery',
    department: 'CCIT',
    avatar: '📊',
  },
];

interface AuthContextType {
  currentUser: PredefinedUser;
  switchUser: (user: PredefinedUser) => Promise<void>;
  isLoading: boolean;
  token: string | null;
  isBackendOffline: boolean;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<PredefinedUser>(() => {
    const saved = localStorage.getItem('iitsm_user_email');
    return SEEDED_USERS.find((u) => u.email === saved) || SEEDED_USERS[0];
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('iitsm_jwt'));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBackendOffline, setIsBackendOffline] = useState<boolean>(false);

  const performLogin = async (user: PredefinedUser): Promise<string | null> => {
    try {
      const resp = await api.auth.login(user.email, 'Bits@2026');
      if (resp && resp.accessToken) {
        localStorage.setItem('iitsm_jwt', resp.accessToken);
        setToken(resp.accessToken);
        setIsBackendOffline(false);
        return resp.accessToken;
      }
      return null;
    } catch (err: any) {
      if (err?.name === 'TypeError' || err?.message?.includes('Failed to fetch') || !err?.status) {
        setIsBackendOffline(true);
      }
      throw err;
    }
  };

  const syncProfile = async (baseUser: PredefinedUser, activeToken: string | null) => {
    if (!activeToken) return;
    try {
      const me: any = await api.auth.getMe();
      if (me) {
        setIsBackendOffline(false);
        setCurrentUser({
          ...baseUser,
          id: me.id || baseUser.id,
          name: me.name || baseUser.name,
          email: me.email || baseUser.email,
          role: me.role || baseUser.role,
          supportTier: me.supportTier || baseUser.supportTier,
          teamId: me.teamId || baseUser.teamId,
          department: me.department || baseUser.department,
        });
      }
    } catch (err: any) {
      if (err?.status === 401) {
        // Re-login once with default credentials and retry
        localStorage.removeItem('iitsm_jwt');
        try {
          const newToken = await performLogin(baseUser);
          if (newToken) {
            const meRetry: any = await api.auth.getMe();
            if (meRetry) {
              setCurrentUser({
                ...baseUser,
                id: meRetry.id || baseUser.id,
                name: meRetry.name || baseUser.name,
                email: meRetry.email || baseUser.email,
                role: meRetry.role || baseUser.role,
                supportTier: meRetry.supportTier || baseUser.supportTier,
                teamId: meRetry.teamId || baseUser.teamId,
                department: meRetry.department || baseUser.department,
              });
            }
          }
        } catch {
          // Re-login failed
        }
      } else if (err?.name === 'TypeError' || err?.message?.includes('Failed to fetch') || !err?.status) {
        setIsBackendOffline(true);
      }
    }
  };

  const switchUser = async (user: PredefinedUser) => {
    setIsLoading(true);
    localStorage.setItem('iitsm_user_email', user.email);
    try {
      const activeToken = await performLogin(user);
      if (activeToken) {
        await syncProfile(user, activeToken);
      } else {
        setCurrentUser(user);
      }
    } catch (e: any) {
      console.warn('Backend login attempt error:', e);
      setCurrentUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSession = useCallback(async () => {
    const savedEmail = localStorage.getItem('iitsm_user_email');
    const user = SEEDED_USERS.find((u) => u.email === savedEmail) || currentUser;
    const existingToken = localStorage.getItem('iitsm_jwt');

    if (existingToken) {
      await syncProfile(user, existingToken);
    } else {
      await switchUser(user);
    }
  }, [currentUser]);

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    (window as any).__switchUser = switchUser;
    (window as any).__SEEDED_USERS = SEEDED_USERS;
  }, [switchUser]);

  return (
    <AuthContext.Provider value={{ currentUser, switchUser, isLoading, token, isBackendOffline, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
