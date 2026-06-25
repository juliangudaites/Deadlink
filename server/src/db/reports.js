import { randomUUID } from 'crypto';
import { createJsonFileStore } from './jsonFile.js';

const file = createJsonFileStore(process.env.REPORTS_PATH || './data/reports.json', { reports: [] });

function readStore() {
  return file.read();
}

function writeStore(data) {
  file.write(data);
}

export function createReport({ linkSlug, category, note }) {
  const store = readStore();
  const report = {
    id: randomUUID(),
    linkSlug: String(linkSlug).trim().toLowerCase(),
    category,
    note: note ? String(note).slice(0, 500) : null,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.reports.unshift(report);
  if (store.reports.length > 5000) store.reports = store.reports.slice(0, 5000);
  writeStore(store);
  return report;
}

export function getReports(status) {
  const store = readStore();
  if (!status) return store.reports;
  return store.reports.filter((r) => r.status === status);
}

export function getReportById(id) {
  return readStore().reports.find((r) => r.id === id) ?? null;
}

export function updateReport(id, patch) {
  const store = readStore();
  const report = store.reports.find((r) => r.id === id);
  if (!report) return null;
  Object.assign(report, patch, { updatedAt: new Date().toISOString() });
  writeStore(store);
  return report;
}

export function getReportStats() {
  const reports = readStore().reports;
  return {
    total: reports.length,
    pending: reports.filter((r) => r.status === 'pending').length,
    confirmed: reports.filter((r) => r.status === 'confirmed').length,
    dismissed: reports.filter((r) => r.status === 'dismissed').length,
  };
}