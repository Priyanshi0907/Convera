function cellColor(v) {
  // v in [0,1] -> interpolate from dark bg to gold
  const from = [34, 28, 22]; // bg-card (#221c16)
  const to = [212, 165, 116]; // gold-400 (#d4a574)
  const rgb = from.map((c, idx) => Math.round(c + (to[idx] - c) * v));
  return `rgb(${rgb.join(",")})`;
}

export default function Heatmap({ names, matrix, selectedPair, onSelectPair }) {
  const n = names.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto pb-2">
        <div
          className="inline-grid gap-1"
          style={{ gridTemplateColumns: `130px repeat(${n}, 76px)` }}
        >
          <div />
          {names.map((name, i) => (
            <div
              key={i}
              className="text-[11px] text-subtle text-center px-1 pb-2 font-medium truncate"
              title={name}
            >
              {name.length > 9 ? name.slice(0, 8) + "…" : name}
            </div>
          ))}

          {matrix.map((row, i) => (
            <div key={`row-${i}`} className="contents">
              <div
                className="text-[12px] text-muted flex items-center pr-3 font-medium truncate"
                title={names[i]}
              >
                {names[i]}
              </div>
              {row.map((v, j) => {
                const isDiag = i === j;
                const isSelected =
                  !isDiag &&
                  selectedPair &&
                  ((selectedPair.i === i && selectedPair.j === j) ||
                    (selectedPair.i === j && selectedPair.j === i));

                return (
                  <button
                    key={`${i}-${j}`}
                    type="button"
                    disabled={isDiag}
                    onClick={() => onSelectPair && !isDiag && onSelectPair(i, j)}
                    className={`w-[72px] h-[52px] rounded-xl flex flex-col items-center justify-center text-[13px] font-semibold transition-all relative ${
                      isDiag
                        ? "opacity-60 cursor-default"
                        : "cursor-pointer hover:scale-105 hover:brightness-125 focus:outline-none"
                    } ${
                      isSelected
                        ? "ring-2 ring-gold-300 shadow-[0_0_14px_rgba(212,165,116,0.4)] scale-105 z-10"
                        : "border border-bg-border/60"
                    }`}
                    style={{
                      backgroundColor: cellColor(v),
                      color: v > 0.55 ? "#15110d" : "#efe2c9",
                    }}
                    title={
                      isDiag
                        ? `${names[i]} (Self match: 100%)`
                        : `${names[i]} vs ${names[j]}: ${(v * 100).toFixed(1)}% (Click to inspect)`
                    }
                  >
                    <span>{(v * 100).toFixed(0)}%</span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-400 absolute bottom-1" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap Legend and instruction */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-bg-border/60 text-[11px] text-subtle">
        <div className="flex items-center gap-2">
          <span>0%</span>
          <div
            className="h-2.5 w-28 rounded-full border border-bg-border"
            style={{
              background: "linear-gradient(to right, rgb(34,28,22), rgb(212,165,116))",
            }}
          />
          <span>100%</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted">
          <span className="w-2 h-2 rounded-full bg-gold-400 inline-block animate-pulse" />
          <span>Click any cell to inspect pair details &amp; breakdown</span>
        </div>
      </div>
    </div>
  );
}
