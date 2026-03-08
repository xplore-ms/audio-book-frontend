import api from './client';
import type { PriceQuote } from '../types';

export interface InitiatePaymentResponse {
  authorization_url: string;
  reference: string;
}

export async function initiatePayment(plan_id: string): Promise<InitiatePaymentResponse> {
  const callback_url = `${window.location.origin}/payment/verify`;
  const res = await api.post('/payments/initiate', { plan_id, callback_url });
  return res.data;
}

export async function verifyPayment(reference: string): Promise<any> {
  const res = await api.post(`/payments/verify/${reference}`);
  return res.data;
}

export async function getPriceQuote(plan_id: string, currency: string, user_id?: string): Promise<PriceQuote> {
  const res = await api.get('/payments/quote', { params: { plan_id, currency, user_id } });
  return res.data;
}
