import { OHLCV, BollingerBandsSettings, BollingerBandsData } from '../types';

/**
 * Calculate Simple Moving Average (SMA) for a series of values.
 * Returns an array the same length as `values` with NaN for indices
 * that don't have enough history to compute the SMA.
 */
function calculateSMA(values: number[], period: number): number[] {
  const result: number[] = [];

  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      // Not enough data points yet to compute the SMA.
      result.push(NaN);
    } else {
      const sum = values.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
      result.push(sum / period);
    }
  }

  return result;
}

/**
 * Calculate sample standard deviation for each window.
 * Uses (period - 1) in the denominator (sample std dev) like many
 * technical indicator libraries do. Values without enough history
 * are represented as NaN.
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
 * Shift an array by `offset` positions. Positive offset shifts data forward.
 * If the offset would read out of bounds we fall back to the original value.
 * This mirrors how some charting packages implement the `offset` parameter.
 */
function applyOffset<T>(data: T[], offset: number): T[] {
  if (offset === 0) return data;

  const result = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    const offsetIndex = i - offset;
    if (offsetIndex >= 0 && offsetIndex < data.length) {
      result[i] = data[offsetIndex];
    } else {
      // Keep original when offset falls outside the data range.
      result[i] = data[i];
    }
  }

  return result;
}

/**
 * Compute Bollinger Bands for a series of OHLCV candles.
 * Returns an array of BollingerBandsData aligned with the input candles.
 *
 * Implementation notes:
 * - Currently only 'close' prices are used as the source.
 * - Uses SMA for the basis and sample standard deviation for the bands.
 * - Applies `offset` to all three series if provided.
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

  // Calculate upper and lower bands as basis ± multiplier * stdDev
  let basisValues = smaValues;
  let upperValues = smaValues.map((sma, i) => 
    isNaN(sma) || isNaN(stdDevValues[i]) ? NaN : sma + (stdDevMultiplier * stdDevValues[i])
  );
  let lowerValues = smaValues.map((sma, i) => 
    isNaN(sma) || isNaN(stdDevValues[i]) ? NaN : sma - (stdDevMultiplier * stdDevValues[i])
  );

  // Apply offset if specified (visual shift of series)
  if (offset !== 0) {
    basisValues = applyOffset(basisValues, offset);
    upperValues = applyOffset(upperValues, offset);
    lowerValues = applyOffset(lowerValues, offset);
  }

  // Combine with timestamps and return. This keeps the API simple for the charting layer.
  return data.map((candle, i) => ({
    timestamp: candle.timestamp,
    basis: basisValues[i],
    upper: upperValues[i],
    lower: lowerValues[i]
  }));
}