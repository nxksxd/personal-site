// Deterministic gradient based on a title so each project keeps a stable
// look even without an uploaded image.
export function gradientFor(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash * 31 + title.charCodeAt(i)) % 360;
  }
  const h1 = hash;
  const h2 = (hash + 48) % 360;
  return `linear-gradient(135deg, hsl(${h1} 70% 55%), hsl(${h2} 70% 45%))`;
}
