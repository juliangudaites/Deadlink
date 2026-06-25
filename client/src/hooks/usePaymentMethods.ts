import { useEffect, useState } from 'react';
import { fetchTierPaymentConfig } from '../api';

export interface PaymentMethodsState {
  bitcoin: boolean;
  stripe: boolean;
  loaded: boolean;
}

const DEFAULT: PaymentMethodsState = { bitcoin: false, stripe: false, loaded: false };

let cached: PaymentMethodsState | null = null;

export function usePaymentMethods(active = true): PaymentMethodsState {
  const [methods, setMethods] = useState<PaymentMethodsState>(cached ?? DEFAULT);

  useEffect(() => {
    if (!active) return;
    if (cached) { setMethods(cached); return; }
    fetchTierPaymentConfig()
      .then((cfg) => {
        const state = { bitcoin: cfg.paymentMethods.bitcoin, stripe: cfg.paymentMethods.stripe, loaded: true };
        cached = state;
        setMethods(state);
      })
      .catch(() => setMethods(DEFAULT));
  }, [active]);

  return methods;
}