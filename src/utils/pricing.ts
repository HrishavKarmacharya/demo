export function calculateOriginalPrice(
  price: number,
  discountPercentage: number
): number | null {
  if (discountPercentage <= 1) return null;
  return price / (1 - discountPercentage / 100);
}