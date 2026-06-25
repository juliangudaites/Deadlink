const KEY = 'deadlink_device_id';

function randomId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = randomId();
    localStorage.setItem(KEY, id);
  }
  return id;
}