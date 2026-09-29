// Deterministic twinkling star field (no hydration mismatch).
export default function Stars({ count = 60 }: { count?: number }) {
  const stars = Array.from({ length: count }, (_, i) => {
    const r = (n: number) => {
      const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
      return (x - Math.floor(x)) * 100;
    };
    return { top: r(1), left: r(2), delay: (r(3) / 100) * 3, size: 1 + (r(4) / 100) * 2.5 };
  });
  return (
    <div className="stars" aria-hidden>
      {stars.map((s, i) => (
        <span
          key={i}
          style={{ top: `${s.top}%`, left: `${s.left}%`, animationDelay: `${s.delay}s`, width: s.size, height: s.size }}
        />
      ))}
    </div>
  );
}
