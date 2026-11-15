import { Incident, IntakeAdvice, AuditVerificationResult, RcaResult, TimelineItem } from '../types';

function safeJson(val: any): any {
  if (!val) return {};
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return {};
  }
}

export function toIncident(r: any): Incident {
  if (!r) return {} as Incident;
  return {
    id: r.id,
    number: r.number,
    title: r.title,
    description: r.description ?? '',
    state: r.status ?? r.state,
    priority: r.priority,
    impact: r.impact,
    urgency: r.urgency,
    category: r.categoryCode ?? r.category,
    serviceCode: r.serviceCode,
    reporterId: r.reporter?.id ?? r.reporterId,
    reporterName: r.reporter?.name ?? r.reporterName,
    reporterEmail: r.reporter?.email ?? r.reporterEmail,
    assigneeId: r.assignee?.id ?? r.assigneeId ?? undefined,
    assigneeName: r.assignee?.name ?? r.assigneeName ?? undefined,
    createdAt: r.createdAt,
    respondedAt: r.respondedAt,
    resolvedAt: r.resolvedAt,
    closedAt: r.closedAt,
    reopenCount: r.reopenCount ?? 0,
    masterIncidentId: r.parentId ?? r.masterIncidentId ?? undefined,
    isMajor: Boolean(r.major ?? r.isMajor),
    childCount: r.childCount ?? 0,
    slaStatus: r.slaStatus ?? 'ON_TRACK',
    responseDueAt: r.responseDueAt ?? undefined,
    resolutionDueAt: r.resolutionDueAt ?? undefined,
    allowedCommands: Array.isArray(r.allowedCommands) ? r.allowedCommands : [],
    priorityExplanation: Array.isArray(r.priorityExplanation) ? r.priorityExplanation : [],
    sla: r.sla,
    resolution: r.resolution,
    rating: r.rating,
    closureNote: r.closureNote,
    version: r.version,
  };
}

export const toTimelineItem = (r: any): TimelineItem => ({
  id: r.id ?? String(Math.random()),
  action: r.eventType ?? r.action ?? 'EVENT',
  actor: r.actorName ?? r.actor ?? 'System',
  actorType: r.actorType ?? 'SYSTEM',
  description: r.summary ?? r.description ?? '',
  payload: safeJson(r.payloadJson ?? r.payload),
  hash: r.hash ?? '',
  ts: r.timestamp ?? r.ts ?? new Date().toISOString(),
});

export const toAuditVerify = (r: any): AuditVerificationResult => ({
  valid: Boolean(r.valid),
  totalRecordsChecked: r.totalRecordsVerified ?? r.totalRecordsChecked ?? 0,
  tamperedRowId: r.firstCorruptedRowId ? String(r.firstCorruptedRowId) : (r.tamperedRowId ? String(r.tamperedRowId) : undefined),
  expectedHash: r.expectedHash,
  actualHash: r.actualHash,
  message: r.reason ?? r.message ?? (r.valid ? 'All audit chains verified successfully.' : 'Verification failed.'),
});

export const toAdvice = (r: any): IntakeAdvice => {
  if (!r) {
    return {
      suggestedCategory: 'SOFTWARE',
      suggestedService: 'APP-ERP',
      suggestedImpact: 2,
      suggestedUrgency: 2,
      confidence: 0.85,
      priorityRationale: 'Evaluated via ITIL Matrix',
      matchedKbs: [],
      potentialDuplicates: []
    };
  }

  const kbs = Array.isArray(r.matchedKbs) ? r.matchedKbs : 
    (Array.isArray(r.kbArticles) ? r.kbArticles.map((kb: any, idx: number) => typeof kb === 'string' ? {
      id: `kb-${idx}`,
      title: kb,
      snippet: kb,
      solution: '',
      serviceCode: r.suggestedService ?? 'APP-ERP',
      relevanceScore: 0.9
    } : kb) : []);

  const dups = Array.isArray(r.potentialDuplicates) ? r.potentialDuplicates :
    (Array.isArray(r.duplicates) ? r.duplicates.map((d: any) => ({
      id: d.candidateId ?? d.id,
      number: d.candidateNumber ?? d.number,
      title: d.candidateTitle ?? d.title,
      score: d.rrfScore ?? d.score ?? 0.8,
      serviceCode: d.serviceCode ?? '',
      state: d.state ?? 'NEW'
    })) : []);

  return {
    suggestedCategory: r.suggestedCategory ?? r.category ?? 'SOFTWARE',
    suggestedService: r.suggestedService ?? r.serviceCode ?? 'APP-ERP',
    suggestedImpact: r.suggestedImpact ?? r.impact ?? 2,
    suggestedUrgency: r.suggestedUrgency ?? r.urgency ?? 2,
    confidence: r.confidence ?? 0.88,
    priorityRationale: r.priorityRationale ?? r.rationale ?? 'Calculated from ITIL Matrix',
    matchedKbs: kbs,
    potentialDuplicates: dups
  };
};

export const toRca = (r: any): RcaResult => {
  if (!r) {
    return {
      incidentId: '',
      rootCauseCandidate: 'CORE-INFRA',
      confidence: 0.9,
      explanation: 'Root cause analysis pending.',
      rankedNodes: []
    };
  }
  return {
    incidentId: r.incidentId ?? '',
    rootCauseCandidate: r.primaryCandidateServiceCode ?? r.rootCauseCandidate ?? '',
    confidence: r.confidence ?? 0.85,
    explanation: r.causalSummary ?? r.explanation ?? '',
    rankedNodes: Array.isArray(r.rankedNodes) ? r.rankedNodes : []
  };
};
