const VOLATILITY = 0.1;

function seededRandom(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }

  return () => {
    h += h << 13;
    h ^= h >>> 7;
    h += h << 3;
    h ^= h >>> 17;
    h += h << 5;
    return (h >>> 0) / 4294967296;
  };
}

export function runMC(saved, retPost, inf, cgTax, expenses, retYears, N = 300, seed = "fire-planner") {
  const rng = seededRandom(seed);

  return Array.from({ length: retYears }, (_, yi) => {
    let ok = 0;

    for (let s = 0; s < N; s++) {
      let p = saved;
      let alive = true;

      for (let t = 1; t <= yi + 1; t++) {
        const adjExp = expenses * Math.pow(1 + inf, t);
        const grossW = adjExp / (1 - cgTax);
        const r = retPost + (rng() - 0.5) * VOLATILITY;
        p = p * (1 + r) - grossW;

        if (p <= 0) {
          alive = false;
          break;
        }
      }

      if (alive) ok++;
    }

    return Math.round((ok / N) * 100);
  });
}
