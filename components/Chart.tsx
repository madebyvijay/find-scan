"use client";

import { useEffect, useRef, useState } from "react";
import { init, dispose } from "klinecharts";
import type { Chart as KLineChart, KLineData } from "klinecharts";
import { OHLCV, BollingerBandsSettings, BollingerBandsData } from "@/lib/types";
import { computeBollingerBands } from "@/lib/indicators/bollinger";

/**
 * Chart component wraps the `klinecharts` library.
 * Responsibilities:
 * - initialize and dispose the chart instance
 * - map OHLCV data into the klinecharts shape
 * - compute and (where supported) apply the Bollinger Bands indicator
 *
 * Notes:
 * - The implementation tries to pass custom styles to the built-in
 *   BOLL indicator but falls back gracefully if the installed chart
 *   version doesn't support options.
 */
interface ChartProps {
  data: OHLCV[];
  bollingerSettings: BollingerBandsSettings;
  showBollinger: boolean;
}

const Chart = ({ data, bollingerSettings, showBollinger }: ChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<KLineChart | null>(null);
  const [bollingerData, setBollingerData] = useState<BollingerBandsData[]>([]);

  // Initialize the chart once on mount and dispose on unmount.
  useEffect(() => {
    if (!chartContainerRef.current) return;

    chartRef.current = init(chartContainerRef.current);

    // Example style tweak to make the grid subtle on dark backgrounds.
    if (chartRef.current) {
      chartRef.current.setStyles({
        grid: {
          horizontal: {
            color: "rgba(255, 255, 255, 0.1)"
          },
          vertical: {
            color: "rgba(255, 255, 255, 0.1)"
          }
        }
      });
    }

    return () => {
      if (chartRef.current) {
        dispose(chartRef.current);
        chartRef.current = null;
      }
    };
  }, []);

  // Push new OHLCV data to the chart whenever `data` changes.
  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    const klineData: KLineData[] = data.map((item) => ({
      timestamp: item.timestamp,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume
    }));

    chartRef.current.applyNewData(klineData);
  }, [data]);

  // Compute Bollinger Bands whenever inputs change. We keep a local copy
  // mostly so we can react to it; the charting library will render the
  // indicator itself when possible.
  useEffect(() => {
    if (!data.length) return;

    const calculatedBands = computeBollingerBands(data, bollingerSettings);
    setBollingerData(calculatedBands);
  }, [data, bollingerSettings]);

  // Add/Remove the BOLL indicator on the chart. This attempts to provide
  // the settings object (styles and params). If the klinecharts version
  // doesn't accept options, the code falls back to calling createIndicator
  // without options to avoid breaking.
  useEffect(() => {
    if (!chartRef.current) return;
    // Remove any existing Bollinger Band indicators first
    chartRef.current.removeIndicator();
    if (!showBollinger || !bollingerData.length) return;

    // The chart instance exposes a `createIndicator` function in some
    // versions. We perform a cautious cast and feature-detect before
    // attempting to pass an options object.
    const createIndicator = (
      chartRef.current as unknown as {
        createIndicator?: (
          name: string,
          overlay?: boolean,
          options?: unknown
        ) => void;
      }
    ).createIndicator;

    if (typeof createIndicator === "function") {
      try {
        createIndicator("BOLL", true, {
          id: "bollinger",
          params: [
            bollingerSettings.length,
            bollingerSettings.stdDevMultiplier
          ],
          styles: {
            upper: {
              color: bollingerSettings.style.upper.color,
              lineWidth: bollingerSettings.style.upper.lineWidth
            },
            lower: {
              color: bollingerSettings.style.lower.color,
              lineWidth: bollingerSettings.style.lower.lineWidth
            },
            basis: {
              color: bollingerSettings.style.basis.color,
              lineWidth: bollingerSettings.style.basis.lineWidth
            },
            fill: { opacity: bollingerSettings.style.fill.opacity }
          }
        });
      } catch (err) {
        // Fallback: try the simple call if passing options is not supported by the installed klinecharts version
        try {
          chartRef.current.createIndicator("BOLL");
        } catch (e) {
          console.warn("Failed to create BOLL indicator with settings", err, e);
        }
      }
    } else {
      // If createIndicator isn't present as a function, try the generic call
      try {
        chartRef.current.createIndicator("BOLL");
      } catch (e) {
        console.warn("createIndicator not available on chart instance", e);
      }
    }
  }, [bollingerData, bollingerSettings, showBollinger]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full h-full bg-chart-background rounded-lg border"
      style={{ height: 600, width: "100%" }}
    />
  );
};

export default Chart;
