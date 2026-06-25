import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import app from './app.js';
import { config } from './config.js';
import { purgeExpiredLinks } from './db/links.js';
import { createJsonFileStore } from './db/jsonFile.js';
import { getBtcRates } from './services/rates.js';
import { isStripeConfigured } from './services/stripe.js';

void getBtcRates().catch(() => {});

function flushAllStores() {
  createJsonFileStore(config.linksPath, { links: [] }).flush();
  createJsonFileStore(process.env.SUBSCRIPTIONS_PATH || './data/subscriptions.json', { subscriptions: [] }).flush();
}

process.on('SIGINT', () => { flushAllStores(); process.exit(0); });
process.on('SIGTERM', () => { flushAllStores(); process.exit(0); });

const bitcoinOn = Boolean(config.bitcoinTipAddress);
const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
app.listen(config.port, () => {
  console.log(`DEADLINK API running on http://localhost:${config.port}`);
  console.log(`Frontend build: ${existsSync(clientDist) ? 'OK' : 'MISSING'} (${clientDist})`);
  console.log(`Production: https://deadlink-site.onrender.com`);
  console.log(`Admin portal: /admin`);
  console.log(`Bitcoin: ${bitcoinOn ? 'ENABLED' : 'disabled'}`);
  console.log(`Stripe: ${isStripeConfigured() ? 'ENABLED' : 'disabled'}`);
  if (config.adminPin === '1373') {
    console.warn('WARNING: Change ADMIN_PIN before going live!');
  }
  setInterval(() => purgeExpiredLinks(), 5 * 60 * 1000);
  purgeExpiredLinks();
});