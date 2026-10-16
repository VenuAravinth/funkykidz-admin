export const LARGE_ADJUSTMENT_UNIT_THRESHOLD = 20;
export const LARGE_ADJUSTMENT_PERCENT_THRESHOLD = 0.2;

export function adjustmentRequiresApproval(systemStock: number, difference: number): boolean {
  const magnitude = Math.abs(difference);
  if (magnitude === 0) return false;
  if (magnitude >= LARGE_ADJUSTMENT_UNIT_THRESHOLD) return true;
  if (systemStock > 0 && magnitude / systemStock >= LARGE_ADJUSTMENT_PERCENT_THRESHOLD) return true;
  return false;
}
