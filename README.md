# DEADLINK

Send it once. Then it's gone.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ADMIN_PIN` | Yes | Admin portal PIN |
| `ENCRYPTION_KEY` | Yes (prod) | 32+ byte hex or passphrase for AES-256-GCM |
| `PUBLIC_APP_URL` | Yes (prod) | `https://deadlink.onrender.com` |
| `STRIPE_SECRET_KEY` | For card tiers | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | For card tiers | Webhook signing secret (`/api/stripe/webhook`) |
| `BITCOIN_TIP_ADDRESS` | Optional | BTC address for tier payments |
| `FREE_CREATES_PER_DAY` | Optional | Default `3` |
| `PORT` | Optional | Default `3001` |
| `VITE_PLAUSIBLE_DOMAIN` | Optional | Analytics (build-time) |
| `VITE_GA4_MEASUREMENT_ID` | Optional | Google Analytics 4 (build-time) |
| `VITE_PUBLIC_SITE_URL` | Optional | Canonical URL for SEO |