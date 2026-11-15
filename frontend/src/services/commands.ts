export const COMMAND_SLUG: Record<string, string> = {
  ACKNOWLEDGE: 'acknowledge',
  START_INVESTIGATION: 'start',
  REQUEST_USER_INFO: 'request-info',
  PROVIDE_USER_INFO: 'provide-info',
  RESOLVE: 'resolve',
  VERIFY: 'verify',
  REJECT_RESOLUTION: 'reject',
  CLOSE: 'close',
  CANCEL: 'cancel',
  DECLARE_MAJOR: 'declare-major',
  REASSIGN: 'reassign',
};

export const COMMAND_LABELS: Record<string, string> = {
  ACKNOWLEDGE: 'Acknowledge',
  START_INVESTIGATION: 'Start Investigation',
  REQUEST_USER_INFO: 'Request Info',
  PROVIDE_USER_INFO: 'Provide Info',
  RESOLVE: 'Resolve Ticket',
  VERIFY: 'Confirm It Is Fixed',
  REJECT_RESOLUTION: 'Not Fixed (Reject)',
  CLOSE: 'Close Ticket',
  CANCEL: 'Cancel Ticket',
  DECLARE_MAJOR: 'Declare Major Incident',
  REASSIGN: 'Reassign Technician',
};
