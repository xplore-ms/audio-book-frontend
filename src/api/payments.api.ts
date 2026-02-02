import api from './client';
import type { PriceQuote } from '../types';

export interface InitiatePaymentResponse {
  authorization_url: string;
  reference: string;
}

export async function initiatePayment(credits: number): Promise<InitiatePaymentResponse> {
  const res = await api.post('/payments/initiate', { credits });
  return res.data;
}

export async function verifyPayment(reference: string): Promise<any> {
  const res = await api.post(`/payments/verify/${reference}`);
  return res.data;
}

export async function getPriceQuote(credits: number, currency: string): Promise<PriceQuote> {
  const res = await api.get('/payments/quote', { params: { credits, currency } });
  return res.data;
}
