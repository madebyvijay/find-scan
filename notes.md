Project: FindScan - Notes and Development Journey

Overview

FindScan is a small web app that demonstrates integration of a candlestick chart
(using klinecharts) with a configurable Bollinger Bands indicator. The app
loads sample OHLCV data from `public/data/ohlcv.json` and lets you add/remove
Bollinger Bands, tweak inputs (length, std dev multiplier, offset) and style
(colors, line widths, fill opacity) via a settings modal.

Why this project

I built FindScan to learn how to wire a lightweight charting engine into a
React/Next.js UI and to understand the full flow of a technical indicator:
- compute on raw OHLCV data
- expose settings in the UI
- apply visualization through the chart library

Key files and responsibilities

- `app/page.tsx` - Main UI, loads data, manages indicator state, and renders
  the `Chart` and `BollingerSettings` modal.
- `components/Chart.tsx` - Thin wrapper around `klinecharts`. Initializes the
  chart, feeds OHLCV data, and creates/removes the built-in BOLL indicator when
  requested.
- `components/BollingerSettings.tsx` - Modal that allows editing the indicator
  inputs and style. Keeps a local copy of settings for immediate responsiveness
  and propagates changes up via `onSettingsChange`.
- `lib/indicators/bollinger.ts` - Pure implementation of Bollinger Bands: SMA
  basis + sample standard deviation, with support for an `offset`.
- `lib/types.ts` - Shared types and default settings.
- `lib/utils.ts` - Small helper `cn` for composing Tailwind classNames.

Development journey (start -> finish)

1. Prototype ideas and shape
   - Started by sketching the UI and deciding to keep the indicator settings
     simple and serializable.
   - Chose `klinecharts` for the visualization because it offers built-in
     indicators and good performance for candlestick charts.

2. Data and types
   - Created a small sample OHLCV JSON file in `public/data/ohlcv.json` to
     iterate quickly without needing a live data source.
   - Defined `OHLCV` as `KLineData` to keep the types compatible with the
     charting lib.

3. Implement the indicator computation
   - Wrote `computeBollingerBands` implementing SMA and sample standard
     deviation. Returned NaN for entries without enough history.
   - Added `offset` support to allow visual shifting of the series.
   - Kept the computation pure (no side effects) so it can be unit tested
     or reused server-side later.

4. UI and chart wiring
   - Implemented `Chart` component to initialize and dispose `klinecharts`.
   - Feed the OHLCV data into the chart and then create the BOLL indicator
     via `createIndicator`. Implemented graceful fallbacks for chart versions
     that don't accept an options object.

5. Settings modal and UX
   - Built `BollingerSettings` with Inputs/Tabs for inputs vs style.
   - Kept a local copy of settings in the modal for snappy UI updates and
     propagated changes to the parent to update the chart live.

6. Polish and documentation
   - Added inline comments to clarify non-obvious behaviors and design
     choices.
   - Wrote this `notes.md` to capture the journey and decisions.

Testing and verification

- Manual smoke test:
  - Start the app (Next.js dev server) and verify the chart loads and the
    Bollinger Bands can be added/removed.
  - Open the settings modal, change parameters and styles, and observe the
    chart updates.

Potential next steps and improvements

- Add unit tests for `computeBollingerBands` covering edge cases
  (small input arrays, negative offsets, non-default multipliers).
- Support alternate moving averages (EMA, WMA) and alternative `source`
  fields (open/high/low) in the indicator implementation.
- Persist user settings in localStorage so toggles survive refresh.
- Add error UI for failed data loads and more robust loading states.
- Extract chart configuration (theme/colors) to a central theme file.

Notes and assumptions made during development

- `klinecharts` is used as an external dependency and the project expects it
  to be installed. The Chart wrapper uses some permissive type casts where the
  library exposes optional or version-dependent APIs.
- The indicator computation assumes `close` is available on each OHLCV entry.

Contact

If you'd like, I can:
- Add unit tests for the indicator implementation.
- Wire up persistence for settings.
- Add another indicator (e.g. RSI) using the same pattern.
