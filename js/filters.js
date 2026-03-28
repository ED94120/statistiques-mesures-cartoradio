function buildFilterOptions(data) {
  return {
    years: getYearRange(data),
    lieuxMesure: getUniqueLieuxMesure(data),
    environnements: getUniqueEnvironments(data),
    laboratoires: getUniqueLaboratories(data)
  };
}

function getYearRange(data) {
  const years = data
    .map(row => row.annee)
    .filter(year => Number.isFinite(year));

  if (years.length === 0) {
    return { min: null, max: null };
  }

  return {
    min: Math.min(...years),
    max: Math.max(...years)
  };
}

function getUniqueLieuxMesure(data) {
  const values = data
    .map(row => row.lieuMesure)
    .filter(value => value != null && value !== "");

  const unique = [...new Set(values)];

  const ordered = [];
  if (unique.includes("En intérieur")) {
    ordered.push("En intérieur");
  }
  if (unique.includes("En extérieur")) {
    ordered.push("En extérieur");
  }

  unique
    .filter(value => value !== "En intérieur" && value !== "En extérieur")
    .sort((a, b) => a.localeCompare(b, "fr"))
    .forEach(value => ordered.push(value));

  return ordered;
}

function getUniqueEnvironments(data) {
  const values = data
    .map(row => row.environnement)
    .filter(value => value != null && value !== "");

  return [...new Set(values)].sort((a, b) => a.localeCompare(b, "fr"));
}

function getUniqueLaboratories(data) {
  const values = data
    .map(row => row.laboratoire)
    .filter(value => value != null && value !== "");

  return [...new Set(values)].sort((a, b) => a.localeCompare(b, "fr"));
}

function applyUserFilters(data, filters) {
  return data.filter(row =>
    matchesYear(row, filters) &&
    matchesLieu(row, filters) &&
    matchesEnvironnement(row, filters) &&
    matchesLaboratoire(row, filters) &&
    matchesCasB(row, filters)
  );
}

function matchesYear(row, filters) {
  if (!Number.isFinite(filters.anneeMin) || !Number.isFinite(filters.anneeMax)) {
    return true;
  }

  if (!Number.isFinite(row.annee)) {
    return false;
  }

  return row.annee >= filters.anneeMin && row.annee <= filters.anneeMax;
}

function matchesLieu(row, filters) {
  if (filters.lieuMesure === "indifferent") {
    return true;
  }

  if (!row.lieuMesure) {
    return false;
  }

  if (filters.lieuMesure === "interieur") {
    return isInterieur(row.lieuMesure);
  }

  if (filters.lieuMesure === "exterieur") {
    return isExterieur(row.lieuMesure);
  }

  return true;
}

function matchesEnvironnement(row, filters) {
  if (filters.environnement === "tous") {
    return true;
  }

  return row.environnement === filters.environnement;
}

function matchesLaboratoire(row, filters) {
  if (filters.laboratoire === "tous") {
    return true;
  }

  return row.laboratoire === filters.laboratoire;
}

function matchesCasB(row, filters) {
  if (filters.casB === "indifferent") {
    return true;
  }

  if (filters.casB === "exists") {
    return hasCasB(row);
  }

  if (filters.casB === "missing") {
    return !hasCasB(row);
  }

  return true;
}

function hasCasB(row) {
  return Number.isFinite(row.cumulCasB) && row.cumulCasB > 0;
}

function isInterieur(value) {
  return /int[ée]rieur/i.test(value);
}

function isExterieur(value) {
  return /ext[ée]rieur/i.test(value);
}
