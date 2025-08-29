"use client";

import { useEffect, useRef, useState } from "react";
import { init, dispose } from "klinecharts";
import type { Chart as KLineChart, KLineData } from "klinecharts";
import { OHLCV, BollingerBandsSettings, BollingerBandsData } from "@/lib/types";
import { computeBollingerBands } from "@/lib/indicators/bollinger";

interface ChartProps {
  data: OHLCV[];
  bollingerSettings: BollingerBandsSettings;
  showBollinger: boolean;
}

const Chart = ({ data, bollingerSettings, showBollinger }: ChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<KLineChart | null>(null);
  const [bollingerData, setBollingerData] = useState<BollingerBandsData[]>([]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize chart with basic configuration
    chartRef.current = init(chartContainerRef.current);

    // Configure grid with lower opacity
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

  // Update chart data
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

  // Calculate Bollinger Bands
  useEffect(() => {
    if (!data.length) return;

    const calculatedBands = computeBollingerBands(data, bollingerSettings);
    setBollingerData(calculatedBands);
  }, [data, bollingerSettings]);

  // Display Bollinger Bands information
  useEffect(() => {
    if (!chartRef.current) return;
    // Remove any existing Bollinger Band indicators first
    chartRef.current.removeIndicator();
    if (!showBollinger || !bollingerData.length) return;

    // Recreate the built-in Bollinger Bands indicator using current settings.
    // The klinecharts API accepts params for built-in indicators (e.g. [length, stdDev]).
    // Cast to any to allow passing the options object without strict type definitions.
    // Use a narrow typed cast to avoid `any` lint complaints while still allowing options to be passed
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
