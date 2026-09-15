import { useMemo } from "react";

const COLORS = [
  "#f43f5e",
  "#fb923c",
  "#facc15",
  "#4ade80",
  "#38bdf8",
  "#a78bfa",
  "#f472b6",
];

type Piece = {
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotate: number;
  drift: number;
};

export default function Confetti({ count = 80 }: { count?: number }) {
  const pieces = useMemo<Piece[]>(() => {
    return Array.from({ length: count }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 6,
      duration: 4 + Math.random() * 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 8,
      rotate: Math.random() * 360,
      drift: (Math.random() - 0.5) * 120,
    }));
  }, [count]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-20">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-[-20px] block rounded-sm"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * 1.6}px`,
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}s linear ${p.delay}s infinite`,
            ["--drift" as string]: `${p.drift}px`,
            ["--rot" as string]: `${p.rotate}deg`,
          }}
        />
      ))}
    </div>
  );
}
