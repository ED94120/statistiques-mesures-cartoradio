const REQUIRED_COLUMNS = {
  dateMesure: "Date de mesure",
  lieuMesure: "Mesure réalisée",
  environnement: "Type d'environnement",
  laboratoire: "laboratoire",
  niveauGlobal: "Niveau global",
  cumulCasB: "Cumul_CasB",
  ratioCasA_CasB: "Ratio_Ecart_CasA_CasB_%"
};

function parseCsv(csvText) {
  if (typeof csvText !== "string" || csvText.trim() === "") {
    throw new Error("Le fichier CSV est vide.");
  }

  const cleanedText = removeBom(csvText).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = splitCsvLines(cleanedText);

  if (lines.length < 2) {
    throw new Error("Le CSV ne contient pas suffisamment de lignes exploitables.");
  }

  const separator = detectSeparator(lines[0]);
  if (!separator) {
    throw new Error("Impossible de détecter un séparateur CSV valide.");
  }

  const headers = parseCsvLine(lines[0], separator).map(cleanCell);
  const headerMap = buildHeaderMap(headers);

  validateRequiredColumns(headerMap);

  const rows = [];
  let invalidRowCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    try {
      const rawCells = parseCsvLine(line, separator);
      const normalizedRow = normalizeRow(rawCells, headerMap, i);
      rows.push(normalizedRow);
    } catch (error) {
      invalidRowCount += 1;
    }
  }

  return {
    headers,
    rows,
    rowCount: rows.length,
    invalidRowCount,
    detectedSeparator: separator
  };
}

function removeBom(text) {
  return text.replace(/^\uFEFF/, "");
}

function splitCsvLines(csvText) {
  return csvText
    .split("\n")
    .map(line => line.trim())
    .filter(line => line !== "");
}

function detectSeparator(headerLine) {
  const candidates = [";", ",", "\t"];
  let bestSeparator = null;
  let bestScore = -1;

  for (const candidate of candidates) {
    const fields = parseCsvLine(headerLine, candidate);
    const score = fields.length;

    if (score > bestScore) {
      bestScore = score;
      bestSeparator = candidate;
    }
  }

  if (bestScore <= 1) {
    return null;
  }

  return bestSeparator;
}

function parseCsvLine(line, separator) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === separator && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

function buildHeaderMap(headers) {
  const headerMap = {};

  headers.forEach((header, index) => {
    headerMap[header] = index;
  });

  return headerMap;
}

function validateRequiredColumns(headerMap) {
  const missingColumns = Object.values(REQUIRED_COLUMNS).filter(
    columnName => !(columnName in headerMap)
  );

  if (missingColumns.length > 0) {
    throw new Error(`Colonnes obligatoires manquantes : ${missingColumns.join(", ")}`);
  }
}

function normalizeRow(rawCells, headerMap, rowIndex) {
  const rawDateMesure = getCell(rawCells, headerMap, REQUIRED_COLUMNS.dateMesure);
  const rawLieuMesure = getCell(rawCells, headerMap, REQUIRED_COLUMNS.lieuMesure);
  const rawEnvironnement = getCell(rawCells, headerMap, REQUIRED_COLUMNS.environnement);
  const rawLaboratoire = getCell(rawCells, headerMap, REQUIRED_COLUMNS.laboratoire);
  const rawNiveauGlobal = getCell(rawCells, headerMap, REQUIRED_COLUMNS.niveauGlobal);
  const rawCumulCasB = getCell(rawCells, headerMap, REQUIRED_COLUMNS.cumulCasB);
  const rawRatio = getCell(rawCells, headerMap, REQUIRED_COLUMNS.ratioCasA_CasB);

  return {
    rowIndex,
    dateMesure: rawDateMesure,
    annee: extractYear(rawDateMesure),
    lieuMesure: normalizeLieuMesure(rawLieuMesure),
    environnement: normalizeEnvironment(rawEnvironnement),
    laboratoire: normalizeLaboratory(rawLaboratoire),
    niveauGlobal: parseFrenchNumber(rawNiveauGlobal),
    cumulCasB: parseFrenchNumber(rawCumulCasB),
    ratioCasA_CasB: parseFrenchNumber(rawRatio),
    raw: {
      [REQUIRED_COLUMNS.dateMesure]: rawDateMesure,
      [REQUIRED_COLUMNS.lieuMesure]: rawLieuMesure,
      [REQUIRED_COLUMNS.environnement]: rawEnvironnement,
      [REQUIRED_COLUMNS.laboratoire]: rawLaboratoire,
      [REQUIRED_COLUMNS.niveauGlobal]: rawNiveauGlobal,
      [REQUIRED_COLUMNS.cumulCasB]: rawCumulCasB,
      [REQUIRED_COLUMNS.ratioCasA_CasB]: rawRatio
    }
  };
}

function getCell(rawCells, headerMap, columnName) {
  const index = headerMap[columnName];
  const value = index < rawCells.length ? rawCells[index] : "";
  return cleanCell(value);
}

function cleanCell(value) {
  if (value == null) {
    return null;
  }

  const cleaned = compactSpaces(String(value).trim());
  return cleaned === "" ? null : cleaned;
}

function compactSpaces(value) {
  return value.replace(/\s+/g, " ").trim();
}

function parseFrenchNumber(value) {
  if (value == null) {
    return null;
  }

  const normalized = String(value)
    .replace(/\s/g, "")
    .replace(",", ".");

  if (normalized === "") {
    return null;
  }

  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function extractYear(dateText) {
  if (!dateText) {
    return null;
  }

  const match = String(dateText).match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
}

function normalizeLieuMesure(value) {
  if (!value) {
    return null;
  }

  const normalized = compactSpaces(value);

  if (/int[ée]rieur/i.test(normalized)) {
    return "En intérieur";
  }

  if (/ext[ée]rieur/i.test(normalized)) {
    return "En extérieur";
  }

  return normalized;
}

function normalizeEnvironment(value) {
  if (!value) {
    return null;
  }

  return compactSpaces(value);
}

function normalizeLaboratory(value) {
  if (!value) {
    return null;
  }

  return compactSpaces(value);
}
