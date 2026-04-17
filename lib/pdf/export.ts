import 'server-only';

export async function generatePDF(reportId: string): Promise<Buffer> {
  console.log(`Generating PDF for report ${reportId}`);
  return Buffer.from("Mock PDF content");
}
