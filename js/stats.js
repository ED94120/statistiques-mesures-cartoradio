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

function computeMean(values) {
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
}

function computeRms(values) {
  const sumSquares = values.reduce((acc, value) => acc + value * value, 0);
  return Math.sqrt(sumSquares / values.length);
}

function isVmVariable(variable) {
  return variable === "niveauGlobal" || variable === "cumulCasB";
}
