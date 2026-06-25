import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { createReport } from '../db/reports.js';

const router = Router();

const VALID_CATEGORIES = new Set(['csam', 'illegal', 'threat', 'spam', 'other']);

const reportLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many reports' },
});

router.post('/', reportLimiter, (req, res) => {
  const { linkSlug, category, note } = req.body ?? {};
  if (!linkSlug || typeof linkSlug !== 'string') {
    return res.status(400).json({ error: 'linkSlug required' });
  }
  if (!VALID_CATEGORIES.has(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  const report = createReport({ linkSlug, category, note });
  res.status(201).json({ report: { id: report.id, status: report.status } });
});

export default router;