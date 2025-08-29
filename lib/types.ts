import type { KLineData } from "klinecharts";

export type OHLCV = KLineData

export interface BollingerBandsSettings {
  length: number;
  maType: 'SMA';
  source: 'close';
  stdDevMultiplier: number;
  offset: number;
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
      opacity: number;
    };
  };
}

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