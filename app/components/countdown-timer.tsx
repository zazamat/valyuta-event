"use client";

import { useEffect, useState } from "react";

type CountdownTimerProps = {
  target: string;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOver: boolean;
};

function getTimeLeft(target: string): TimeLeft {
  const difference = new Date(target).getTime() - Date.now();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isOver: true,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isOver: false,
  };
}

export function CountdownTimer({ target }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const update = () => setTimeLeft(getTimeLeft(target));

    update();
    const interval = window.setInterval(update, 1000);

    return () => window.clearInterval(interval);
  }, [target]);

  const items = [
    ["Gün", timeLeft?.days],
    ["Saat", timeLeft?.hours],
    ["Dəqiqə", timeLeft?.minutes],
    ["Saniyə", timeLeft?.seconds],
  ];

  if (timeLeft?.isOver) {
    return (
      <div className="rounded-lg border border-white/15 bg-white/10 p-4 text-sm text-white/80">
        Tədbirin başlama vaxtı çatıb.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2" aria-label="Tədbirə geri sayım">
      {items.map(([label, value]) => (
        <div
          className="rounded-lg border border-white/15 bg-white/10 p-3 text-center"
          key={label}
        >
          <strong className="block text-2xl font-semibold tabular-nums text-white">
            {typeof value === "number" ? String(value).padStart(2, "0") : "--"}
          </strong>
          <span className="mt-1 block text-xs text-white/60">{label}</span>
        </div>
      ))}
    </div>
  );
}
