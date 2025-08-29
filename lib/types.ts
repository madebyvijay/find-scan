import type { KLineData } from "klinecharts";

// Reuse KLineData from klinecharts as the project's OHLCV shape.
// This keeps type compatibility with the charting library and
// avoids copying the structure. KLineData already includes
// timestamp, open, high, low, close and volume fields.
export type OHLCV = KLineData

/**
 * Settings used to configure the Bollinger Bands indicator.
 * Kept intentionally small and serializable so the UI can
 * store and pass this object around without surprises.
 */
export interface BollingerBandsSettings {
  length: number; // window length for SMA/stddev
  maType: 'SMA'; // currently only SMA is implemented
  source: 'close'; // only 'close' supported for now
  stdDevMultiplier: number; // multiplier for bands (typically 2)
  offset: number; // visual shift of the series
  style: {
    basis: {
      visible: boolean;
      color: string;
      lineWidth: number;
      lineStyle: 'solid' | 'dashed';
    };
    upper: {
      visible: boolean;
      color: string;
      lineWidth: number;
      lineStyle: 'solid' | 'dashed';
    };
    lower: {
      visible: boolean;
      color: string;
      lineWidth: number;
      lineStyle: 'solid' | 'dashed';
    };
    fill: {
      visible: boolean;
      opacity: number; // 0..1 alpha for band fill
    };
  };
}

// Data point shape returned by the indicator computation. The arrays
// returned by computeBollingerBands align 1:1 with the input candles.
export interface BollingerBandsData {
  timestamp: number;
  basis: number;
  upper: number;
  lower: number;
}

export const DEFAULT_BOLLINGER_SETTINGS: BollingerBandsSettings = {
  length: 20,
  maType: 'SMA',
  source: 'close',
  stdDevMultiplier: 2,
  offset: 0,
  style: {
    basis: {
      visible: true,
      color: '#a78bfa',
      lineWidth: 1,
      lineStyle: 'solid'
    },
    upper: {
      visible: true,
      color: '#a78bfa',
      lineWidth: 1,
      lineStyle: 'solid'
    },
    lower: {
      visible: true,
      color: '#a78bfa',
      lineWidth: 1,
      lineStyle: 'solid'
    },
    fill: {
      visible: true,
      opacity: 0.1
    }
  }
};