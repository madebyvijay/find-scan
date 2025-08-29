import { OHLCV, BollingerBandsSettings, BollingerBandsData } from '../types';

/**
 * Calculate Simple Moving Average
 */
function calculateSMA(values: number[], period: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const sum = values.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
      result.push(sum / period);
    }
  }
  
  return result;
}

/**
 * Calculate Standard Deviation (using sample standard deviation)
 */
function calculateStandardDeviation(values: number[], period: number, means: number[]): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1 || isNaN(means[i])) {
      result.push(NaN);
    } else {
      const slice = values.slice(i - period + 1, i + 1);
      const mean = means[i];
      const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (period - 1);
      result.push(Math.sqrt(variance));
    }
  }
  
  return result;
}

/**
 * Apply offset to data array
 */
function applyOffset<T>(data: T[], offset: number): T[] {
  if (offset === 0) return data;
  
  const result = new Array(data.length);
  
  for (let i = 0; i < data.length; i++) {
    const offsetIndex = i - offset;
    if (offsetIndex >= 0 && offsetIndex < data.length) {
      result[i] = data[offsetIndex];
    } else {
      result[i] = data[i]; // Keep original if offset goes out of bounds
    }
  }
  
  return result;
}

/**
 * Compute Bollinger Bands indicator
 */
export function computeBollingerBands(
  data: OHLCV[],
  settings: BollingerBandsSettings
): BollingerBandsData[] {
  if (data.length === 0) return [];
  
  const { length, stdDevMultiplier, offset } = settings;
  
  // Extract close prices based on source (only 'close' supported for now)
  const closes = data.map(d => d.close);
  
  // Calculate SMA (basis line)
  const smaValues = calculateSMA(closes, length);
  
  // Calculate Standard Deviation
  const stdDevValues = calculateStandardDeviation(closes, length, smaValues);
  
  // Calculate upper and lower bands
  let basisValues = smaValues;
  let upperValues = smaValues.map((sma, i) => 
    isNaN(sma) || isNaN(stdDevValues[i]) ? NaN : sma + (stdDevMultiplier * stdDevValues[i])
  );
  let lowerValues = smaValues.map((sma, i) => 
    isNaN(sma) || isNaN(stdDevValues[i]) ? NaN : sma - (stdDevMultiplier * stdDevValues[i])
  );
  
  // Apply offset if specified
  if (offset !== 0) {
    basisValues = applyOffset(basisValues, offset);
    upperValues = applyOffset(upperValues, offset);
    lowerValues = applyOffset(lowerValues, offset);
  }
  
  // Combine with timestamps
  return data.map((candle, i) => ({
    timestamp: candle.timestamp,
    basis: basisValues[i],
    upper: upperValues[i],
    lower: lowerValues[i]
  }));
}