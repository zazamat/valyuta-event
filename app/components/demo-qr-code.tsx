function isQrCellDark(index: number) {
  const size = 13;
  const x = index % size;
  const y = Math.floor(index / size);
  const inFinder = (originX: number, originY: number) => {
    const dx = x - originX;
    const dy = y - originY;
    if (dx < 0 || dy < 0 || dx > 4 || dy > 4) return false;
    return dx === 0 || dy === 0 || dx === 4 || dy === 4 || (dx === 2 && dy === 2);
  };

  if (inFinder(0, 0) || inFinder(8, 0) || inFinder(0, 8)) return true;
  return (x * 7 + y * 11 + x * y) % 5 === 0 || (x + y) % 7 === 0;
}

export function DemoQrCode({ active }: { active: boolean }) {
  const cells = Array.from({ length: 169 }, (_, index) => index).filter(
    isQrCellDark,
  );

  return (
    <div className={`qr-shell ${active ? "scan-pulse" : ""}`}>
      <svg
        aria-label="Demo QR bilet"
        className="qr-svg"
        role="img"
        viewBox="0 0 13 13"
      >
        <rect fill="#ffffff" height="13" width="13" />
        {cells.map((index) => {
          const x = index % 13;
          const y = Math.floor(index / 13);
          return (
            <rect
              fill="#101510"
              height="0.82"
              key={index}
              rx="0.08"
              width="0.82"
              x={x + 0.09}
              y={y + 0.09}
            />
          );
        })}
      </svg>
      {active && <span className="scan-line" />}
    </div>
  );
}
