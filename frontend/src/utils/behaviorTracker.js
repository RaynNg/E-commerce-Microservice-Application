/**
 * Fire-and-forget behavior tracking.
 * Does not block UI; silently ignores errors.
 */
const BEHAVIOR_URL = `${import.meta.env.VITE_API_URL || ""}/api/behavior/track/`;

export const trackBehavior = (customerId, bookId, action, metadata = {}) => {
  if (!customerId || !bookId) return;

  const payload = { customer_id: customerId, book_id: bookId, action, metadata };

  fetch(BEHAVIOR_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
};
