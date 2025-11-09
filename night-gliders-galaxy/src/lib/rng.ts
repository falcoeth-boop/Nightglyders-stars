export function hashSeed(str: string) {
  let h = 2166136261;
  for (let i=0;i<str.length;i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function seededPos(seedStr: string) {
  let s = hashSeed(seedStr);
  const rand = () => ((s = Math.imul(s ^ (s >>> 15), 2246822519) ^ 0x85ebca6b) >>> 0) / 2**32;
  const radius = 40 + rand()*160;
  const theta = rand()*Math.PI*2;
  const phi = Math.acos(2*rand()-1);
  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta)
  };
}