import { getStoredAccessCode } from '../tiers/storage';
import { getOrCreateDeviceId } from '../tiers/deviceId';

export function tierHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const code = getStoredAccessCode();
  const deviceId = getOrCreateDeviceId();
  if (code) headers['X-Deadlink-Code'] = code;
  if (deviceId) headers['X-Deadlink-Device'] = deviceId;
  return headers;
}