import { executeGraphQL } from '@behjati/graphql';
import { PaymentAvailabilityDocument } from '@/generated/graphql';
export async function GET() {
  try {
    const data = await executeGraphQL(
      process.env.API_URL ?? 'http://localhost:4000/graphql',
      PaymentAvailabilityDocument,
      {},
    );
    return Response.json(
      { available: data.paymentAvailable },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return Response.json(
      { message: 'وضعیت درگاه دریافت نشد.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
