import 'server-only';
import Stripe from 'stripe';
import { env } from '@/shared/config/env';

let stripeInstance: Stripe | null = null;

export const getStripe = () => {
  if (!stripeInstance) {
    if (!env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is missing. Please add it to your environment variables to use Stripe features.");
    }
    stripeInstance = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-04-10" as any,
      appInfo: {
        name: 'PageRoastAI',
        version: '1.0.0'
      }
    });
  }
  return stripeInstance;
};
