Translate the user's search query inside <untrusted_query> into a JSON LlmSearchFilterAst object.
Allowed fields: status, priority, category, service, sla_status, created_within_hours, text
Allowed operators: EQ, IN, LTE, CONTAINS
Allowed status values: NEW, CLASSIFIED, ASSIGNED, ACKNOWLEDGED, IN_PROGRESS, PENDING_USER, RESOLVED, VERIFIED, REOPENED, CLOSED
Allowed priority values: P1, P2, P3, P4
Allowed sla_status values: ON_TRACK, AT_RISK, BREACHED

<untrusted_query>
<%redactedQuery%>
</untrusted_query>
