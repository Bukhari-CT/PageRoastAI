import * as React from 'react';

interface ReceiptEmailProps {
  amount: string;
}

export function ReceiptEmail({ amount }: ReceiptEmailProps) {
  return (
    <div style={{ fontFamily: 'sans-serif', color: '#333' }}>
      <h1>Thank you for your purchase!</h1>
      <p>We've received your payment of {amount}.</p>
      <p>You now have full access to your PageRoast reports.</p>
    </div>
  );
}
