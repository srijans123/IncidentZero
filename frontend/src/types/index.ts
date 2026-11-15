export type IncidentState =
  | 'NEW'
  | 'CLASSIFIED'
  | 'ASSIGNED'
  | 'ACKNOWLEDGED'
  | 'IN_PROGRESS'
  | 'PENDING_USER'
  | 'RESOLVED'
  | 'VERIFIED'
  | 'CLOSED'
  | 'CANCELLED'
  | 'REOPENED';

export type Priority = 'P1' | 'P2' | 'P3' | 'P4';
export type SlaStatus = 'ON_TRACK' | 'AT_RISK' | 'BREACHED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'EMPLOYEE' | 'TECHNICIAN' | 'ADMINISTRATOR';
  supportTier?: 'L1' | 'SENIOR' | 'TEAM_LEAD';
  teamId?: string;
  teamName?: string;
  token?: string;
}

export interface PriorityExplanationStep {
  rule: string;
  before: string;
  after: string;
  reason: string;
}

export interface IncidentResolution {
  code: string;
  notes: string;
  rootCauseCategory?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface SlaPolicyDetail {
  policyTier?: string;
  responseTimeMinutes?: number;
  resolutionTimeMinutes?: number;
}

export interface Incident {
  id: string;
  number: string;
  title: string;
  description: string;
  state: IncidentState;
  priority: Priority;
  impact?: number;
  urgency?: number;
  category?: string;
  serviceCode?: string;
  reporterId?: string;
  reporterEmail?: string;
  reporterName?: string;
  assigneeId?: string;
  assigneeName?: string;
  createdAt: string;
  respondedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  reopenCount: number;
  masterIncidentId?: string;
  isMajor: boolean;
  childCount?: number;
  slaStatus: SlaStatus;
  responseDueAt?: string;
  resolutionDueAt?: string;
  allowedCommands: string[];
  priorityExplanation?: PriorityExplanationStep[];
  sla?: SlaPolicyDetail;
  resolution?: IncidentResolution;
  rating?: number;
  closureNote?: string;
  version?: number;
}


export interface AuditRecord {
  id: string;
  incidentId: string;
  sequence: number;
  fromState?: string;
  toState?: string;
  actorId: string;
  action: string;
  comment?: string;
  hash: string;
  prevHash?: string;
  timestamp: string;
}

export interface TimelineItem {
  id: string;
  action: string;
  actor?: string;
  actorType?: string;
  description: string;
  payload?: any;
  hash?: string;
  ts: string;
}

export interface TimelineEvent {

  id: string;
  timestamp: string;
  actor: string;
  type: 'STATUS_CHANGE' | 'COMMENT' | 'SYSTEM' | 'AI' | 'SLA';
  message: string;
  details?: Record<string, any>;
  isInternal?: boolean;
}

export interface KbArticle {
  id: string;
  title: string;
  snippet: string;
  solution: string;
  serviceCode: string;
  relevanceScore: number;
}

export interface DuplicateMatch {
  id: string;
  number: string;
  title: string;
  score: number;
  serviceCode: string;
  state: IncidentState;
}

export interface IntakeAdvice {
  suggestedCategory: string;
  suggestedService: string;
  suggestedImpact: number;
  suggestedUrgency: number;
  confidence: number;
  priorityRationale: string;
  matchedKbs: KbArticle[];
  potentialDuplicates: DuplicateMatch[];
}

export interface ServiceNode {
  id: string;
  code: string;
  name: string;
  tier: 'T1' | 'T2' | 'T3';
  ownerTeam: string;
  status: 'HEALTHY' | 'DEGRADED' | 'OUTAGE';
  dependencies: string[];
}

export interface RcaResult {
  incidentId: string;
  rootCauseCandidate: string;
  confidence: number;
  explanation: string;
  rankedNodes: {
    serviceCode: string;
    score: number;
    blastRadius: number;
    isLeafSafe: boolean;
  }[];
}

export interface AuditVerificationResult {
  valid: boolean;
  totalRecordsChecked: number;
  tamperedRowId?: string;
  expectedHash?: string;
  actualHash?: string;
  message: string;
}
