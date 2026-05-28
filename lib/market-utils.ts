export function calculateAveragePrice(
  hotels: any[],
  star: number
) {
  const filtered = hotels.filter(
    (hotel) =>
      hotel.propertyClass === star
  );

  if (!filtered.length) return 0;

  const total = filtered.reduce(
    (sum, hotel) =>
      sum +
      (hotel.priceBreakdown
        ?.grossPrice?.value || 0),
    0
  );

  return Math.round(
    total / filtered.length
  );
}

export function getPriceGap(
  current: number,
  previous: number
) {
  return Math.abs(current - previous);
}