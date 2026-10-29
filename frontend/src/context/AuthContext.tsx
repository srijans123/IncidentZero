import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

export interface PredefinedUser {
  id: string;
  email: string;
  name: string;
  role: 'EMPLOYEE' | 'TECHNICIAN' | 'ADMINISTRATOR';
  supportTier?: 'L1' | 'SENIOR' | 'TEAM_LEAD';
  teamName: string;
  department: string;
  avatar: string;
}

export const SEEDED_USERS: PredefinedUser[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'emp@bits.campus',
    name: 'Ananya Sen',
    role: 'EMPLOYEE',
    teamName: 'Undergraduate',
    department: 'Computer Science',
    avatar: '👩‍🎓',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'diya@bits.campus',
    name: 'Diya Sharma',
    role: 'EMPLOYEE',
    teamName: 'Postgraduate',
    department: 'Electrical Engineering',
    avatar: '🔬',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'tech.rohan@bits.campus',
    name: 'Rohan Kulkarni',
    role: 'TECHNICIAN',
    supportTier: 'SENIOR',
    teamName: 'Infrastructure & ERP',
    department: 'CCIT',
    avatar: '👨‍💻',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'tech.vikram@bits.campus',
    name: 'Vikram Joshi',
    role: 'TECHNICIAN',
    supportTier: 'L1',
    teamName: 'Campus Service Desk',
    department: 'CCIT',
    avatar: '🛠️',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    email: 'lead.priya@bits.campus',
    name: 'Priya Nair',
    role: 'TECHNICIAN',
    supportTier: 'TEAM_LEAD',
    teamName: 'Applications Team',
    department: 'CCIT',
    avatar: '👩‍💼',
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    email: 'tech.ananya@bits.campus',
    name: 'Ananya Rao',
    role: 'TECHNICIAN',
    supportTier: 'L1',
    teamName: 'Network Ops (NOC)',
    department: 'CCIT',
    avatar: '📡',
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    email: 'admin@bits.campus',
    name: 'Prof. S. Rangan',
    role: 'ADMINISTRATOR',
    teamName: 'IT Governance',
    department: 'Administration',
    avatar: '⚡',
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    email: 'manager@bits.campus',
    name: 'Dr. M. Iyer',
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<PredefinedUser>(() => {
    const saved = localStorage.getItem('iitsm_user_email');
    return SEEDED_USERS.find((u) => u.email === saved) || SEEDED_USERS[0];
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('iitsm_jwt'));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const switchUser = async (user: PredefinedUser) => {
    setIsLoading(true);
    try {
      // Attempt backend login
      const resp = await api.auth.login(user.email, 'Bits@2026');
      if (resp && resp.accessToken) {
        localStorage.setItem('iitsm_jwt', resp.accessToken);
        setToken(resp.accessToken);
      }
    } catch (e) {
      console.warn('Backend login deferred, setting demo fallback session', e);
    } finally {
      localStorage.setItem('iitsm_user_email', user.email);
      setCurrentUser(user);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial token fetch for default user if token missing
    if (!token) {
      switchUser(currentUser);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, switchUser, isLoading, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
