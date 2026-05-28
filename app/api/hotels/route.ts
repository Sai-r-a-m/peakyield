import { NextResponse } from 'next/server';
import { getCurrencyForCountry } from '@/lib/currency-utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || 'New York';

  try {
    // Step 1: Get location ID + country code
    const locationResponse = await fetch(
      `https://booking-com18.p.rapidapi.com/stays/auto-complete?query=${encodeURIComponent(city)}`,
      {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
          'X-RapidAPI-Host': 'booking-com18.p.rapidapi.com',
        },
      }
    );

    const locationData = await locationResponse.json();
    const cityResult = locationData.data.find((item: any) => item.dest_type === 'city');
    const locationId = cityResult?.id;

    if (!locationId) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }

    // Detect local currency from country code (cc1 is ISO 3166-1 alpha-2)
    const countryCode: string = (cityResult?.cc1 || 'US').toUpperCase();
    const currency = getCurrencyForCountry(countryCode);

    // Use tomorrow → day-after-tomorrow so Booking.com always returns live availability
    const checkin = new Date();
    checkin.setDate(checkin.getDate() + 1);
    const checkout = new Date(checkin);
    checkout.setDate(checkout.getDate() + 1);
    const fmt = (d: Date) => d.toISOString().split('T')[0];

    // Step 2: Search hotels in local currency
    const hotelsResponse = await fetch(
      `https://booking-com18.p.rapidapi.com/stays/search?locationId=${encodeURIComponent(locationId)}&checkinDate=${fmt(checkin)}&checkoutDate=${fmt(checkout)}&adults=2&rooms=1&units=metric&temperature=c&currencyCode=${currency.code}`,
      {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
          'X-RapidAPI-Host': 'booking-com18.p.rapidapi.com',
        },
      }
    );

    const hotelsData = await hotelsResponse.json();

    return NextResponse.json({
      data: hotelsData.data || [],
      currency,
      countryCode,
    });

  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
