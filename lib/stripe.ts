import 'server-only';
import Stripe from 'stripe';
import { env } from '@/shared/config/env';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY || "sk_test_dummy", {
  apiVersion: "2024-04-10" as any,
  appInfo: {
    name: 'PageRoastAI',
    version: '1.0.0'
  }
});
