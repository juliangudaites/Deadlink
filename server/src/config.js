import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

export const config = {
  port: Number(process.env.PORT) || 3001,
  adminPin: process.env.ADMIN_PIN || '1373',
  encryptionKey: process.env.ENCRYPTION_KEY || '',
  linksPath: process.env.LINKS_PATH || './data/links.json',
  freeCreatesPerDay: process.env.FREE_CREATES_PER_DAY != null
    ? Number(process.env.FREE_CREATES_PER_DAY)
    : -1,
  bitcoinTipAddress: process.env.BITCOIN_TIP_ADDRESS || '',
  btcpayUrl: process.env.BTCPAY_URL || '',
  btcpayStoreId: process.env.BTCPAY_STORE_ID || '',
  btcpayApiKey: process.env.BTCPAY_API_KEY || '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  publicAppUrl: process.env.PUBLIC_APP_URL || process.env.RENDER_EXTERNAL_URL || '',
};