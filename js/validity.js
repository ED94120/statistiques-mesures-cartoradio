function getValidRowsForVariable(rows, variable, filters) {
  const thresholdResult = applyCasAThreshold(
    rows,
    filters.seuilCasAActif,
    filters.seuilCasA
  );

  const variableValidityResult = applyVariableValidity(
    thresholdResult.remainingRows,
    variable
  );

  return {
    validRows: variableValidityResult.validRows,
    thresholdExcludedRows: thresholdResult.excludedRows,
    invalidRows: variableValidityResult.invalidRows,
    thresholdExcludedCount: thresholdResult.excludedRows.length,
    invalidExcludedCount: variableValidityResult.invalidRows.length
  };
}

function applyCasAThreshold(rows, seuilActif, seuil) {
  if (!seuilActif) {
    return {
      remainingRows: rows.slice(),
      excludedRows: []
    };
  }

  const remainingRows = [];
  const excludedRows = [];

  rows.forEach(row => {
    if (Number.isFinite(row.niveauGlobal) && row.niveauGlobal >= seuil) {
      remainingRows.push(row);
    } else {
      excludedRows.push(row);
    }
  });

  return {
    remainingRows,
    excludedRows
  };
}

function applyVariableValidity(rows, variable) {
  const validRows = [];
  const invalidRows = [];

  rows.forEach(row => {
    let isValid = false;

    if (variable === "niveauGlobal") {
      isValid = isValidForCasA(row);
    } else if (variable === "cumulCasB") {
      isValid = isValidForCasB(row);
    } else if (variable === "ratioCasA_CasB") {
      isValid = isValidForRatio(row);
    }

    if (isValid) {
      validRows.push(row);
    } else {
      invalidRows.push(row);
    }
  });

  return { validRows, invalidRows };
}

function isValidForCasA(row) {
  return Number.isFinite(row.niveauGlobal);
}

function isValidForCasB(row) {
  return Number.isFinite(row.cumulCasB) && row.cumulCasB > 0;
}

function isValidForRatio(row) {
  return (
    Number.isFinite(row.ratioCasA_CasB) &&
    Number.isFinite(row.cumulCasB) &&
    row.cumulCasB > 0
  );
}

function extractValues(validRows, variable) {
  return validRows
    .map(row => row[variable])
    .filter(value => Number.isFinite(value));
}
