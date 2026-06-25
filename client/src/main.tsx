import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { TierProvider } from './tiers/context';
import { captureRefFromUrl } from './utils/refCapture';
import { captureEndorselyViaFromUrl } from './utils/endorsely';

captureRefFromUrl();
captureEndorselyViaFromUrl();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TierProvider>
      <App />
    </TierProvider>
  </StrictMode>
);