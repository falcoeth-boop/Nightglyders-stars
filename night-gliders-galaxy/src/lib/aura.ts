export function auraRateByCount(count: number): number {
  if (count >= 100) return 10;
  if (count >= 85)  return 9;
  if (count >= 70)  return 8;
  if (count >= 50)  return 7;
  if (count >= 33)  return 6;
  if (count >= 25)  return 5;
  if (count >= 15)  return 4;
  if (count >= 10)  return 3;
  if (count >= 5)   return 2;
  if (count >= 1)   return 1;
  return 0;
}

export function accrueAura(prevTotal: number, last: number, ratePerDay: number): { total: number; now: number } {
  const now = Date.now();
  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.floor((now - last) / msPerDay);
  const add = Math.max(0, days) * ratePerDay;
  return { total: prevTotal + add, now };
}