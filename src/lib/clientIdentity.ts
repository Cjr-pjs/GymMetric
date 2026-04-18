const CLIENT_ID_KEY = 'gymmetric_client_id';

export function getOrCreateClientId() {
  const existing = localStorage.getItem(CLIENT_ID_KEY);
  if (existing) {
    return existing;
  }

  const newId = crypto.randomUUID();
  localStorage.setItem(CLIENT_ID_KEY, newId);
  return newId;
}
