function computeStats(values, variable) {
  const cleanValues = sanitizeNumericArray(values);

  if (cleanValues.length === 0) {
    return createEmptyStatsResult();
  }

  const sortedValues = [...cleanValues].sort((a, b) => a - b);

  return {
    count: cleanValues.length,
    min: computeMin(sortedValues),
    max: computeMax(sortedValues),
    median: computeMedian(sortedValues),
    mean: computeMean(cleanValues),
    p90: computePercentile(sortedValues, 0.90),
    p95: computePercentile(sortedValues, 0.95),
    p98: computePercentile(sortedValues, 0.98),
    percentCasASuperieurCasB: variable === "ratioCasA_CasB"
      ? computePercentGreaterThanZero(cleanValues)
      : null,
    rms: isVmVariable(variable) ? computeRms(cleanValues) : null
  };
}

function sanitizeNumericArray(values) {
  return values.filter(value => Number.isFinite(value));
}

function createEmptyStatsResult() {
  return {
    count: 0,
    min: null,
    max: null,
    median: null,
    mean: null,
    p90: null,
    p95: null,
    p98: null,
    percentCasASuperieurCasB: null,
    rms: null
  };
}

function computeMin(sortedValues) {
  return sortedValues[0];
}

function computeMax(sortedValues) {
  return sortedValues[sortedValues.length - 1];
}

function computeMedian(sortedValues) {
  const n = sortedValues.length;
  const mid = Math.floor(n / 2);

  if (n % 2 !== 0) {
    return sortedValues[mid];
  }

  return (sortedValues[mid - 1] + sortedValues[mid]) / 2;
}

function computePercentile(sortedValues, p) {
  const n = sortedValues.length;

  if (n === 0) {
    return null;
  }

  if (n === 1) {
    return sortedValues[0];
  }

  const position = (n - 1) * p;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);

  if (lowerIndex === upperIndex) {
    return sortedValues[lowerIndex];
  }

  const weight = position - lowerIndex;

  return (
    sortedValues[lowerIndex] * (1 - weight) +
    sortedValues[upperIndex] * weight
  );
}

function computeMean(values) {
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
}

function computeRms(values) {
  const sumSquares = values.reduce((acc, value) => acc + value * value, 0);
  return Math.sqrt(sumSquares / values.length);
}

function computePercentGreaterThanZero(values) {
  if (!values || values.length === 0) {
    return null;
  }

  const countGreaterThanZero = values.filter(value => value > 0).length;

  return (countGreaterThanZero / values.length) * 100;
}

function isVmVariable(variable) {
  return variable === "niveauGlobal" || variable === "cumulCasB";
}
