/**
 * Simple in-memory / console audit logger for security & tracking key administrative & transactional actions.
 */
const logAudit = (action, performedBy, details = {}) => {
  const timestamp = new Date().toISOString();
  const userId = performedBy ? (performedBy._id || performedBy.id || performedBy) : 'System';
  const userRole = performedBy ? (performedBy.role || 'N/A') : 'System';

  const logEntry = {
    timestamp,
    action,
    performedBy: { userId, role: userRole },
    details
  };

  console.log(`[AUDIT LOG] ${timestamp} | ACTION: ${action} | BY: ${userId} (${userRole}) | DETAILS:`, JSON.stringify(details));
  return logEntry;
};

module.exports = logAudit;
