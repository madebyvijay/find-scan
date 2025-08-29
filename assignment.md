# What am i building (in plain words)

You’ll make a candle chart that draws three curvy lines (Bollinger Bands) on top: a middle line (average), an upper line, and a lower line. A small settings panel lets you tweak numbers and colors like TradingView. You **must** use React + Next.js + TypeScript + Tailwind + **KLineCharts only**, and include the exact inputs/styles listed in the brief.&#x20;

---

# Zero-BS Step-by-Step

## 0) Prereqs (do these first)

* Install **Node 18+** and **VS Code**.
* Sign into **GitHub** (you’ll need a repo later).
* You’ll work in one folder only.

## 1) Create the app (fastest safe path)

```bash
npx create-next-app@latest findscan-bbands --ts --tailwind
cd findscan-bbands
npm i klinecharts
```

Tailwind is auto-wired by the flag, so no manual setup pain.

## 2) Add demo price data (you need 200+ candles)

I generated a clean **ohlcv.json** for you (300 candles). Put it at:
`/public/data/ohlcv.json`
[Download ohlcv.json](sandbox:/mnt/data/ohlcv.json).
The assignment explicitly wants 200+ candles; this covers it.&#x20;

## 3) Define types (keep it neat)

Create **/lib/types.ts**

```ts
export type Candle = {
  time: number; // ms epoch
  open: number; high: number; low: number; close: number;
  volume: number;
};

export type BBInputs = {
  length: number;        // default 20
  maType: 'SMA';         // SMA only for now
  source: 'close';       // close only
  stdDevMult: number;    // default 2
  offset: number;        // default 0
};

export type BBStyle = {
  showMiddle: boolean; middleColor: string; middleWidth: number; middleStyle: 'solid'|'dashed';
  showUpper: boolean;  upperColor: string;  upperWidth: number;  upperStyle: 'solid'|'dashed';
  showLower: boolean;  lowerColor: string;  lowerWidth: number;  lowerStyle: 'solid'|'dashed';
  showFill: boolean;   fillOpacity: number; // 0..1
};

export type BBPoint = {
  time: number;
  basis?: number; upper?: number; lower?: number;
};
```

## 4) Compute the bands (the only math you truly need)

Create **/lib/indicators/bollinger.ts**

```ts
import { Candle, BBInputs, BBPoint } from '../types';

// Population std dev (divide by N). Documented choice as required by the brief.
function sma(values: number[], length: number): number | undefined {
  if (values.length < length) return undefined;
  let sum = 0;
  for (let i = values.length - length; i < values.length; i++) sum += values[i];
  return sum / length;
}

function popStd(values: number[], length: number): number | undefined {
  if (values.length < length) return undefined;
  const slice = values.slice(values.length - length);
  const mean = slice.reduce((a,b)=>a+b,0) / length;
  let s2 = 0;
  for (const v of slice) s2 += (v - mean) * (v - mean);
  return Math.sqrt(s2 / length);
}

export function computeBollingerBands(
  candles: Candle[],
  inputs: BBInputs
): BBPoint[] {
  const src = candles.map(c => c.close); // source = close (per brief)
  const out: BBPoint[] = [];
  for (let i = 0; i < candles.length; i++) {
    const upto = src.slice(0, i + 1);
    const basis = sma(upto, inputs.length);
    const sd = popStd(upto, inputs.length);
    let upper: number | undefined, lower: number | undefined;
    if (basis !== undefined && sd !== undefined) {
      upper = basis + inputs.stdDevMult * sd;
      lower = basis - inputs.stdDevMult * sd;
    }
    out.push({ time: candles[i].time, basis, upper, lower });
  }

  // Apply offset (shift forward by N bars; negative shifts backward)
  const shift = inputs.offset | 0;
  if (shift !== 0) {
    const copy = out.map(p => ({...p}));
    for (let i = 0; i < out.length; i++) {
      const j = i + shift;
      if (j >= 0 && j < out.length) out[j] = copy[i];
    }
  }
  return out;
}
```

This matches the brief’s formulas and offset rule. You **must** recompute on every input change.&#x20;

## 5) Minimal page with chart + button + modal

* Make **/components/BollingerSettings.tsx** with two tabs: **Inputs** (length, SMA, source=close, stdDev, offset) and **Style** (show/hide, color, width, dashed/solid, fill opacity). All fields must exist with the exact defaults. UI can be simple Tailwind; it does **not** need to pixel-match TradingView—just the spirit.&#x20;
* Make **/components/Chart.tsx** that:

  1. Initializes **KLineCharts** on mount,
  2. Loads `/data/ohlcv.json` and renders candlesticks,
  3. Draws three line overlays for basis/upper/lower using your computed array,
  4. (Optional) fills the area between upper & lower if `showFill` is true (use canvas fill or the library’s overlay fill if available),
  5. Hooks the crosshair/tooltip so hovering a candle shows Basis/Upper/Lower.

👉 Use the library’s official docs to init and update the chart. Don’t guess APIs—wire it exactly per docs. The brief strictly says **KLineCharts only**.&#x20;

## 6) Wire settings → instant updates

* Keep settings in React state with these defaults:

  * length=20, maType='SMA', source='close', stdDevMult=2, offset=0.
  * Middle/Upper/Lower visibility on, widths 2, solid lines; fill off, opacity \~0.2.
* On any change, call `computeBollingerBands()` and redraw overlays immediately (no page refresh). That’s a hard requirement.&#x20;

## 7) Add the “Add Indicator” flow

* Start without bands.
* Clicking **“Add Bollinger Bands”** mounts the overlays using current defaults and opens Settings. The brief requires a simple add-once action.&#x20;

## 8) Make it not ugly (but don’t waste time)

* Dark background, sensible default colors (e.g., middle = gray, upper = green, lower = red, fill faint). The brief asks for clean, simple UI; don’t obsess over pixel-perfect TradingView.&#x20;

## 9) README + screenshots (don’t skip—reviewers care)

Create **README.md** with:

* Setup: `npm i && npm run dev`
* Note: “Bollinger uses **population** std dev (÷N).”
* KLineCharts version you used.
* Two screenshots or a short GIF showing the indicator + settings.
  These are mandatory deliverables.&#x20;

## 10) Acceptance criteria checklist (tick them yourself)

* ✅ Bands behave correctly; basis tracks SMA; upper/lower breathe with volatility; offset shifts the three series.
* ✅ Settings panel (Inputs + Style) works; toggles, widths, dashed/solid, fill opacity all apply instantly.
* ✅ Smooth on 200–1,000 candles (no jank).
* ✅ Code is type-safe, modular (`computeBollingerBands()` in `/lib`), not tangled with page.
* ✅ **No other** chart libs used.
  All from the brief—hit each one or expect pushback.&#x20;

## 11) Folder layout (use this unless you have a better one)

```
/app/page.tsx                 // chart + add button + modal
/components/Chart.tsx
/components/BollingerSettings.tsx
/lib/indicators/bollinger.ts
/lib/types.ts
/public/data/ohlcv.json
README.md
```

Matches the suggested structure in the brief.&#x20;

## 12) Final turn-in

* Push to GitHub (or zip).
* (Optional) Deploy to Vercel.
* Add a short “trade-offs / known issues” note if anything isn’t perfect.
* The brief mentions a **3-day** deadline—respect it.&#x20;

---

# Common mistakes I will call out now

* Using another chart lib “just for lines.” **Rejected.** The brief forbids it.&#x20;
* Ignoring **offset** logic. Reviewers will check it.&#x20;
* Half-baked settings panel (missing style toggles or fill opacity). **Not acceptable.**&#x20;
* Slow recalculation on input change. With 200–1,000 candles, it should feel instant. If it lags, fix your state updates or rendering.&#x20;

---

If you want, I can turn this into a tiny starter repo structure with the compute function wired and a stub Chart component so you only fill in the KLineCharts bits.
