function computeHistogram(values, graphState, variable) {
  const cleanValues = values.filter(value => Number.isFinite(value));

  if (cleanValues.length === 0) {
    return createEmptyHistogramResult(graphState);
  }

  const range = getGraphRange(cleanValues, graphState, variable);
  validateGraphRange(range.min, range.max, graphState.nbClasses);

  const adjustedRange = expandDegenerateRange(range.min, range.max, variable);
  const bins = buildBins(adjustedRange.min, adjustedRange.max, graphState.nbClasses);
  fillBins(cleanValues, bins, adjustedRange.min, adjustedRange.max);

  const classWidth = computeClassWidth(
    adjustedRange.min,
    adjustedRange.max,
    graphState.nbClasses
  );

  const visibleCount = countVisibleValues(
    cleanValues,
    adjustedRange.min,
    adjustedRange.max
  );

  return {
    graphMin: adjustedRange.min,
    graphMax: adjustedRange.max,
    nbClasses: graphState.nbClasses,
    classWidth,
    visibleCount,
    hiddenCount: cleanValues.length - visibleCount,
    bins
  };
}

function createEmptyHistogramResult(graphState) {
  return {
    graphMin: null,
    graphMax: null,
    nbClasses: graphState.nbClasses,
    classWidth: null,
    visibleCount: 0,
    hiddenCount: 0,
    bins: []
  };
}

function getGraphRange(values, graphState, variable) {
  if (graphState.mode === "manual") {
    return {
      min: Number(graphState.min),
      max: Number(graphState.max)
    };
  }

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  if (isVmVariable(variable)) {
    return {
      min: 0,
      max: maxValue
    };
  }

  return {
    min: minValue,
    max: maxValue
  };
}

function validateGraphRange(min, max, nbClasses) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new Error("Bornes du graphique invalides.");
  }

  if (!(max > min)) {
    throw new Error("La borne maximale du graphique doit être supérieure à la borne minimale.");
  }

  if (!Number.isInteger(nbClasses) || nbClasses <= 0) {
    throw new Error("Le nombre de classes doit être un entier strictement positif.");
  }
}

function expandDegenerateRange(min, max, variable) {
  if (max > min) {
    return { min, max };
  }

  const margin = isVmVariable(variable) ? 0.1 : 1;

  return {
    min: min - margin,
    max: max + margin
  };
}

function computeClassWidth(min, max, nbClasses) {
  return (max - min) / nbClasses;
}

function buildBins(min, max, nbClasses) {
  const classWidth = computeClassWidth(min, max, nbClasses);
  const bins = [];

  for (let i = 0; i < nbClasses; i++) {
    const x0 = min + i * classWidth;
    const x1 = x0 + classWidth;

    bins.push({
      index: i,
      x0,
      x1,
      count: 0
    });
  }

  return bins;
}

function fillBins(values, bins, min, max) {
  if (!bins.length) {
    return;
  }

  const nbClasses = bins.length;
  const classWidth = bins[0].x1 - bins[0].x0;

  values.forEach(value => {
    if (value < min || value > max) {
      return;
    }

    let index;

    if (value === max) {
      index = nbClasses - 1;
    } else {
      index = Math.floor((value - min) / classWidth);
    }

    if (index >= 0 && index < nbClasses) {
      bins[index].count += 1;
    }
  });
}

function countVisibleValues(values, min, max) {
  return values.filter(value => value >= min && value <= max).length;
}
