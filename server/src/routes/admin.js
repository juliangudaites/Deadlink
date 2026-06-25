import { Router } from 'express';
import { createSession, validatePin, requireAdmin, revokeSession } from '../middleware/adminAuth.js';
import { config } from '../config.js';
import { isStripeConfigured } from '../services/stripe.js';
import { getLinkStats, getAllLinksAdmin, purgeExpiredLinks } from '../db/links.js';
import { getSubscriptionsAdmin, markSubscriptionPaid } from '../db/subscriptions.js';
import { getReports, getReportById, updateReport, getReportStats } from '../db/reports.js';

const router = Router();

router.post('/login', (req, res) => {
  const { pin } = req.body ?? {};
  if (!pin || !validatePin(pin)) {
    return res.status(401).json({ error: 'Invalid PIN' });
  }
  const token = createSession();
  res.json({ token, expiresInHours: 8 });
});

router.post('/logout', requireAdmin, (req, res) => {
  revokeSession(req.adminToken);
  res.json({ success: true });
});

router.get('/stats', requireAdmin, (_req, res) => {
  const links = getLinkStats();
  const subs = getSubscriptionsAdmin(500);
  const paidSubs = subs.filter((s) => s.status === 'paid');
  const revenue = {
    shadow: paidSubs.filter((s) => s.tier === 'shadow').length * 19,
    void: paidSubs.filter((s) => s.tier === 'void').length * 49,
    spectre: paidSubs.filter((s) => s.tier === 'spectre').length * 199,
  };
  res.json({
    links,
    reports: getReportStats(),
    subscriptions: { total: subs.length, active: paidSubs.length },
    revenue,
    payments: { bitcoin: Boolean(config.bitcoinTipAddress), stripe: isStripeConfigured() },
  });
});

router.get('/links', requireAdmin, (req, res) => {
  const limit = Number(req.query.limit) || 100;
  res.json({ links: getAllLinksAdmin(limit) });
});

router.get('/reports', requireAdmin, (req, res) => {
  const status = req.query.status;
  res.json({ reports: getReports(status || undefined) });
});

router.patch('/reports/:id', requireAdmin, (req, res) => {
  const report = getReportById(req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  const { action } = req.body ?? {};
  if (action === 'confirm') {
    return res.json({ report: updateReport(report.id, { status: 'confirmed' }) });
  }
  if (action === 'dismiss') {
    return res.json({ report: updateReport(report.id, { status: 'dismissed' }) });
  }
  return res.status(400).json({ error: 'Invalid action' });
});

router.get('/subscriptions', requireAdmin, (req, res) => {
  const limit = Number(req.query.limit) || 50;
  res.json({ subscriptions: getSubscriptionsAdmin(limit) });
});

router.post('/subscriptions/:id/confirm', requireAdmin, (req, res) => {
  const paid = markSubscriptionPaid(req.params.id);
  if (!paid) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true, accessCode: paid.accessCode, tier: paid.tier, expiresAt: paid.expiresAt });
});

router.post('/purge', requireAdmin, (_req, res) => {
  purgeExpiredLinks();
  res.json({ ok: true });
});

export default router;