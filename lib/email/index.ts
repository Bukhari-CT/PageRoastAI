import 'server-only';

export async function sendReceiptEmail(to: string, amount: string) {
  console.log(`Sending receipt for ${amount} to ${to}`);
  return { data: true, error: null };
}
