const dom = {};

document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
  resetState();
  cacheDomReferences();
  bindEvents();
  renderEmptyState();
  updateGraphModeUi();
}

function cacheDomReferences() {
  dom.workspace = document.getElementById("workspace");
  dom.graphSection = document.getElementById("graph-section");

  dom.fileInput = document.getElementById("csv-file-input");
  dom.dropZone = document.getElementById("drop-zone");
  dom.newFileBtn = document.getElementById("new-file-btn");

  dom.sourceName = document.getElementById("source-name");
  dom.sourceRowCount = document.getElementById("source-row-count");
  dom.sourcePeriod = document.getElementById("source-period");

  dom.importMessage = document.getElementById("import-message");
  dom.importError = document.getElementById("import-error");
  dom.analysisMessage = document.getElementById("analysis-message");
  dom.analysisError = document.getElementById("analysis-error");
  dom.graphMessage = document.getElementById("graph-message");
  dom.graphError = document.getElementById("graph-error");

  dom.yearMinInput = document.getElementById("year-min-input");
  dom.yearMaxInput = document.getElementById("year-max-input");
  dom.measureLocationSelect = document.getElementById("measure-location-select");
  dom.environmentSelect = document.getElementById("environment-select");
  dom.laboratorySelect = document.getElementById("laboratory-select");
  dom.casbSelect = document.getElementById("casb-select");
  dom.casaThresholdEnabled = document.getElementById("casa-threshold-enabled");
  dom.casaThresholdInput = document.getElementById("casa-threshold-input");
  dom.analysisVariableSelect = document.getElementById("analysis-variable-select");

  dom.applyFiltersBtn = document.getElementById("apply-filters-btn");
  dom.resetFiltersBtn = document.getElementById("reset-filters-btn");

  dom.summaryTotalRows = document.getElementById("summary-total-rows");
  dom.summaryFilteredRows = document.getElementById("summary-filtered-rows");
  dom.summaryThresholdExcluded = document.getElementById("summary-threshold-excluded");
  dom.summaryInvalidExcluded = document.getElementById("summary-invalid-excluded");
  dom.summaryValidValues = document.getElementById("summary-valid-values");
  dom.activeFiltersSummary = document.getElementById("active-filters-summary");
  dom.statsCards = document.getElementById("stats-cards");

  dom.graphModeSelect = document.getElementById("graph-mode-select");
  dom.graphMinInput = document.getElementById("graph-min-input");
  dom.graphMaxInput = document.getElementById("graph-max-input");
  dom.graphClassesInput = document.getElementById("graph-classes-input");
  dom.graphClassWidthOutput = document.getElementById("graph-class-width-output");
  dom.resetGraphBtn = document.getElementById("reset-graph-btn");
  dom.exportPngBtn = document.getElementById("export-png-btn");

  dom.graphTitle = document.getElementById("graph-title");
  dom.graphSource = document.getElementById("graph-source");
  dom.graphAnalysisMeta = document.getElementById("graph-analysis-meta");
  dom.graphExportMeta = document.getElementById("graph-export-meta");
  dom.graphAnalysedCount = document.getElementById("graph-analysed-count");
  dom.graphVisibleCount = document.getElementById("graph-visible-count");
  dom.graphHiddenCount = document.getElementById("graph-hidden-count");
  dom.graphUnit = document.getElementById("graph-unit");

  dom.histogramCanvas = document.getElementById("histogram-canvas");
}

function bindEvents() {
  dom.fileInput.addEventListener("change", onFileSelected);
  dom.newFileBtn.addEventListener("click", onNewFile);

  dom.applyFiltersBtn.addEventListener("click", handleUiChange);
  dom.resetFiltersBtn.addEventListener("click", onResetFilters);

  dom.graphModeSelect.addEventListener("change", handleGraphChange);
  dom.graphMinInput.addEventListener("change", handleGraphChange);
  dom.graphMaxInput.addEventListener("change", handleGraphChange);
  dom.graphClassesInput.addEventListener("change", handleGraphChange);
  dom.resetGraphBtn.addEventListener("click", onResetGraph);

  dom.exportPngBtn.addEventListener("click", onExportPng);

  dom.dropZone.addEventListener("dragover", onDragOver);
  dom.dropZone.addEventListener("drop", onFileDrop);
}

function onDragOver(event) {
  event.preventDefault();
}

async function onFileDrop(event) {
  event.preventDefault();
  clearMessages();

  const file = event.dataTransfer?.files?.[0];
  if (!file) {
    dom.importError.textContent = "Aucun fichier détecté dans le dépôt.";
    return;
  }

  await loadFile(file);
}

function renderEmptyState() {
  dom.workspace.classList.add("hidden");
  dom.graphSection.classList.add("hidden");

  dom.sourceName.textContent = "Source : —";
  dom.sourceRowCount.textContent = "Lignes : —";
  dom.sourcePeriod.textContent = "Période : —";

  dom.summaryTotalRows.textContent = "—";
  dom.summaryFilteredRows.textContent = "—";
  dom.summaryThresholdExcluded.textContent = "—";
  dom.summaryInvalidExcluded.textContent = "—";
  dom.summaryValidValues.textContent = "—";

  dom.activeFiltersSummary.textContent = "—";
  dom.statsCards.innerHTML = "";

  dom.graphTitle.textContent = "—";
  dom.graphSource.textContent = "—";
  dom.graphAnalysisMeta.textContent = "—";
  dom.graphExportMeta.textContent = "—";
  dom.graphAnalysedCount.textContent = "—";
  dom.graphVisibleCount.textContent = "—";
  dom.graphHiddenCount.textContent = "—";
  dom.graphUnit.textContent = "—";
  dom.graphClassWidthOutput.textContent = "—";

  clearMessages();
  clearCanvas();
}

function clearMessages() {
  dom.importMessage.textContent = "";
  dom.importError.textContent = "";
  dom.analysisMessage.textContent = "";
  dom.analysisError.textContent = "";
  dom.graphMessage.textContent = "";
  dom.graphError.textContent = "";
}

function showLoadedLayout() {
  dom.workspace.classList.remove("hidden");
  dom.graphSection.classList.remove("hidden");
}

async function onFileSelected(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  await loadFile(file);
}

async function loadFile(file) {
  clearMessages();

  try {
    const text = await file.text();
    loadAndAnalyze(text, file.name);
  } catch (error) {
    dom.importError.textContent = "Lecture du fichier impossible.";
  }
}


function loadAndAnalyze(csvText, sourceName) {
  clearMessages();

  try {
    const parseResult = parseCsv(csvText);

    appState.rawCsvText = csvText;
    appState.sourceName = sourceName;
    appState.columns = parseResult.headers;
    appState.data = parseResult.rows;
    appState.filterOptions = buildFilterOptions(appState.data);

    resetFiltersToDefault();
    resetGraphToDefault();

    populateDynamicFilterControls();
    syncStateToControls();
    showLoadedLayout();
    updateFilteredPreview(parseResult);
  } catch (error) {
    renderEmptyState();
    dom.importError.textContent = error.message || "Erreur de parsing du fichier CSV.";
  }
}

function populateDynamicFilterControls() {
  populateSelect(
    dom.environmentSelect,
    appState.filterOptions.environnements,
    "tous",
    "Tous"
  );

  populateSelect(
    dom.laboratorySelect,
    appState.filterOptions.laboratoires,
    "tous",
    "Tous"
  );
}

function populateSelect(selectElement, values, defaultValue, defaultLabel) {
  selectElement.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = defaultValue;
  defaultOption.textContent = defaultLabel;
  selectElement.appendChild(defaultOption);

  values.forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    selectElement.appendChild(option);
  });
}

function syncStateToControls() {
  dom.yearMinInput.value = appState.filters.anneeMin ?? "";
  dom.yearMaxInput.value = appState.filters.anneeMax ?? "";
  dom.measureLocationSelect.value = appState.filters.lieuMesure;
  dom.environmentSelect.value = appState.filters.environnement;
  dom.laboratorySelect.value = appState.filters.laboratoire;
  dom.casbSelect.value = appState.filters.casB;
  dom.casaThresholdEnabled.checked = appState.filters.seuilCasAActif;
  dom.casaThresholdInput.value = appState.filters.seuilCasA;
  dom.analysisVariableSelect.value = appState.analyse.variable;

  dom.graphModeSelect.value = appState.graph.mode;
  dom.graphMinInput.value = appState.graph.min ?? "";
  dom.graphMaxInput.value = appState.graph.max ?? "";
  dom.graphClassesInput.value = appState.graph.nbClasses;
  updateGraphModeUi();
}

function syncControlsToState() {
  appState.filters.anneeMin =
    dom.yearMinInput.value === "" ? null : Number(dom.yearMinInput.value);
  appState.filters.anneeMax =
    dom.yearMaxInput.value === "" ? null : Number(dom.yearMaxInput.value);
  appState.filters.lieuMesure = dom.measureLocationSelect.value;
  appState.filters.environnement = dom.environmentSelect.value || "tous";
  appState.filters.laboratoire = dom.laboratorySelect.value || "tous";
  appState.filters.casB = dom.casbSelect.value;
  appState.filters.seuilCasAActif = dom.casaThresholdEnabled.checked;
  appState.filters.seuilCasA = Number(dom.casaThresholdInput.value);

  appState.analyse.variable = dom.analysisVariableSelect.value;

  appState.graph.mode = dom.graphModeSelect.value;
  appState.graph.min =
    dom.graphMinInput.value === "" ? null : Number(dom.graphMinInput.value);
  appState.graph.max =
    dom.graphMaxInput.value === "" ? null : Number(dom.graphMaxInput.value);
  appState.graph.nbClasses = Number(dom.graphClassesInput.value);
}

function updateGraphModeUi() {
  const isAuto = dom.graphModeSelect.value === "auto";

  dom.graphMinInput.disabled = isAuto;
  dom.graphMaxInput.disabled = isAuto;
}

function handleUiChange() {
  clearMessages();
  syncControlsToState();

  if (!appState.data.length) {
    dom.analysisError.textContent = "Aucune donnée chargée.";
    return;
  }

  try {
    updateAnalysis();
  } catch (error) {
    dom.analysisError.textContent =
      error.message || "Erreur pendant le calcul de l’analyse.";
  }
}

function updateAnalysis() {
  const filteredRows = applyUserFilters(appState.data, appState.filters);

  const validityResult = getValidRowsForVariable(
    filteredRows,
    appState.analyse.variable,
    appState.filters
  );

  const values = extractValues(
    validityResult.validRows,
    appState.analyse.variable
  );

  const stats = computeStats(values, appState.analyse.variable);
  const histogram = computeHistogram(
    values,
    appState.graph,
    appState.analyse.variable
  );

  appState.results.filteredRows = filteredRows;
  appState.results.validRows = validityResult.validRows;
  appState.results.values = values;
  appState.results.stats = stats;
  appState.results.histogram = histogram;

  appState.results.counters.totalRows = appState.data.length;
  appState.results.counters.filteredRowsCount = filteredRows.length;
  appState.results.counters.thresholdExcludedCount =
    validityResult.thresholdExcludedCount;
  appState.results.counters.invalidExcludedCount =
    validityResult.invalidExcludedCount;
  appState.results.counters.validRowsCount = validityResult.validRows.length;

  renderAnalysisPreview();
}

function updateFilteredPreview(parseResult) {
  const periodText =
    appState.filterOptions.years.min != null &&
    appState.filterOptions.years.max != null
      ? `${appState.filterOptions.years.min} – ${appState.filterOptions.years.max}`
      : "—";

  dom.sourceName.textContent = `Source : ${appState.sourceName || "—"}`;
  dom.sourceRowCount.textContent = `Lignes : ${appState.data.length}`;
  dom.sourcePeriod.textContent = `Période : ${periodText}`;

  appState.results.filteredRows = appState.data.slice();
  appState.results.validRows = [];
  appState.results.values = [];
  appState.results.stats = null;
  appState.results.histogram = null;

  appState.results.counters.totalRows = appState.data.length;
  appState.results.counters.filteredRowsCount = appState.data.length;
  appState.results.counters.thresholdExcludedCount = 0;
  appState.results.counters.invalidExcludedCount = 0;
  appState.results.counters.validRowsCount = 0;

  dom.importMessage.textContent =
    `Fichier chargé avec succès. ${appState.data.length} lignes normalisées` +
    (parseResult.invalidRowCount > 0
      ? `, ${parseResult.invalidRowCount} lignes ignorées.`
      : ".");

  renderAnalysisPreview();
}

function renderAnalysisPreview() {
  const stats = appState.results.stats;
  const histogram = appState.results.histogram;

  dom.summaryTotalRows.textContent = String(appState.results.counters.totalRows);
  dom.summaryFilteredRows.textContent = String(
    appState.results.counters.filteredRowsCount
  );
  dom.summaryThresholdExcluded.textContent = String(
    appState.results.counters.thresholdExcludedCount
  );
  dom.summaryInvalidExcluded.textContent = String(
    appState.results.counters.invalidExcludedCount
  );
  dom.summaryValidValues.textContent = String(
    appState.results.counters.validRowsCount
  );

  dom.activeFiltersSummary.textContent = buildActiveFiltersText();
  dom.statsCards.innerHTML = buildStatsCardsHtml(
    stats,
    appState.analyse.variable
  );

  if (appState.results.counters.filteredRowsCount === 0) {
    dom.analysisMessage.textContent =
      "Aucune mesure ne correspond aux filtres sélectionnés.";
  } else if (appState.results.counters.validRowsCount === 0) {
    dom.analysisMessage.textContent =
      "Aucune valeur exploitable pour la grandeur sélectionnée.";
  } else {
    dom.analysisMessage.textContent = "Analyse calculée avec succès.";
  }

  dom.graphTitle.textContent = `Histogramme — ${getVariableLabel(
    appState.analyse.variable
  )}`;
  dom.graphSource.textContent = `Source : ${appState.sourceName || "—"}`;
  dom.graphAnalysisMeta.textContent = `N = ${
    appState.results.counters.validRowsCount
  } | ${buildShortGraphMeta()}`;
  dom.graphExportMeta.textContent = "Statistiques Mesures Cartoradio";
  dom.graphAnalysedCount.textContent = String(
    appState.results.counters.validRowsCount
  );
  dom.graphVisibleCount.textContent = histogram
    ? String(histogram.visibleCount)
    : "0";
  dom.graphHiddenCount.textContent = histogram
    ? String(histogram.hiddenCount)
    : "0";
  dom.graphUnit.textContent = getVariableUnit(appState.analyse.variable);
  dom.graphClassWidthOutput.textContent =
    histogram && histogram.classWidth != null
      ? formatNumber(histogram.classWidth, 3)
      : "—";

  drawHistogramPreview(histogram, stats, appState.analyse.variable);
}

function buildStatsCardsHtml(stats, variable) {
  if (!stats || stats.count === 0) {
    return `
      <div class="stat-card">
        <span class="stat-label">Statut</span>
        <span class="stat-value">Aucune valeur</span>
      </div>
    `;
  }

  const unit = getVariableUnit(variable);
  const showRms = isVmVariable(variable);

  return `
    <div class="stat-card">
      <span class="stat-label">Effectif</span>
      <span class="stat-value">${stats.count}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Minimum</span>
      <span class="stat-value">${formatStatValue(stats.min, unit)}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Maximum</span>
      <span class="stat-value">${formatStatValue(stats.max, unit)}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Médiane</span>
      <span class="stat-value">${formatStatValue(stats.median, unit)}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Moyenne</span>
      <span class="stat-value">${formatStatValue(stats.mean, unit)}</span>
    </div>
    ${
      showRms
        ? `
    <div class="stat-card">
      <span class="stat-label">Moyenne quadratique</span>
      <span class="stat-value">${formatStatValue(stats.rms, unit)}</span>
    </div>
    `
        : ""
    }
  `;
}

function buildActiveFiltersText() {
  const lieuText =
    appState.filters.lieuMesure === "indifferent"
      ? "Indifférent"
      : appState.filters.lieuMesure === "interieur"
      ? "En intérieur"
      : "En extérieur";

  const casBText =
    appState.filters.casB === "indifferent"
      ? "Indifférent"
      : appState.filters.casB === "exists"
      ? "Cas B existe"
      : "Cas B n’existe pas";

  const seuilText = appState.filters.seuilCasAActif
    ? `${appState.filters.seuilCasA} V/m`
    : "désactivé";

  return [
    `Période : ${appState.filters.anneeMin ?? "—"} – ${
      appState.filters.anneeMax ?? "—"
    }`,
    `Lieu : ${lieuText}`,
    `Environnement : ${
      appState.filters.environnement === "tous"
        ? "Tous"
        : appState.filters.environnement
    }`,
    `Laboratoire : ${
      appState.filters.laboratoire === "tous"
        ? "Tous"
        : appState.filters.laboratoire
    }`,
    `Cas B : ${casBText}`,
    `Seuil Cas A : ${seuilText}`,
    `Grandeur : ${
      dom.analysisVariableSelect.options[
        dom.analysisVariableSelect.selectedIndex
      ]?.textContent || "—"
    }`
  ].join(" | ");
}

function buildShortGraphMeta() {
  const parts = [];

  if (
    Number.isFinite(appState.filters.anneeMin) &&
    Number.isFinite(appState.filters.anneeMax)
  ) {
    parts.push(`${appState.filters.anneeMin}–${appState.filters.anneeMax}`);
  }

  if (appState.filters.lieuMesure === "interieur") {
    parts.push("En intérieur");
  } else if (appState.filters.lieuMesure === "exterieur") {
    parts.push("En extérieur");
  } else {
    parts.push("Lieu indifférent");
  }

  if (appState.filters.casB === "exists") {
    parts.push("Cas B existe");
  } else if (appState.filters.casB === "missing") {
    parts.push("Cas B n’existe pas");
  } else {
    parts.push("Cas B indifférent");
  }

  if (appState.filters.seuilCasAActif) {
    parts.push(`Seuil Cas A = ${appState.filters.seuilCasA} V/m`);
  } else {
    parts.push("Seuil Cas A désactivé");
  }

  return parts.join(" | ");
}

function handleGraphChange() {
  clearMessages();
  syncControlsToState();
  updateGraphModeUi();

  if (!appState.results.values || appState.results.values.length === 0) {
    dom.graphMessage.textContent =
      "Aucune valeur exploitable pour recalculer l’histogramme.";
    return;
  }

  try {
    const histogram = computeHistogram(
      appState.results.values,
      appState.graph,
      appState.analyse.variable
    );

    appState.results.histogram = histogram;
    renderAnalysisPreview();
  } catch (error) {
    dom.graphError.textContent =
      error.message || "Erreur pendant le recalcul de l’histogramme.";
  }
}

function onResetFilters() {
  resetFiltersToDefault();
  syncStateToControls();

  if (appState.data.length > 0) {
    handleUiChange();
  }
}

function onResetGraph() {
  resetGraphToDefault();
  syncStateToControls();

  if (appState.results.values && appState.results.values.length > 0) {
    handleGraphChange();
  } else {
    clearCanvas();
    dom.graphMessage.textContent = "Affichage du graphique réinitialisé.";
  }
}

function onNewFile() {
  resetState();
  dom.fileInput.value = "";
  renderEmptyState();
}

function onExportPng() {
  dom.graphMessage.textContent =
    "L’export PNG sera branché après le rendu du graphique.";
}

function getVariableLabel(variable) {
  if (variable === "niveauGlobal") return "Exposition Cas A";
  if (variable === "cumulCasB") return "Cumul Cas B";
  if (variable === "ratioCasA_CasB") return "Cohérence Cas A / Cas B";
  return "Grandeur inconnue";
}

function getVariableUnit(variable) {
  if (variable === "ratioCasA_CasB") return "%";
  return "V/m";
}

function formatNumber(value, decimals = 2) {
  if (!Number.isFinite(value)) {
    return "—";
  }
  return value.toFixed(decimals);
}

function formatStatValue(value, unit) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  const decimals = unit === "%" ? 2 : 3;
  return `${value.toFixed(decimals)} ${unit}`;
}

function drawHistogramPreview(histogram, stats, variable) {
  clearCanvas();

  const canvas = dom.histogramCanvas;
  const ctx = canvas.getContext("2d");

  if (!histogram || !histogram.bins || histogram.bins.length === 0) {
    ctx.fillStyle = "#666";
    ctx.font = "16px Arial";
    ctx.fillText("Aucune donnée à afficher.", 30, 40);
    return;
  }

  const width = canvas.width;
  const height = canvas.height;

  const marginLeft = 70;
  const marginRight = 20;
  const marginTop = 30;
  const marginBottom = 60;

  const plotWidth = width - marginLeft - marginRight;
  const plotHeight = height - marginTop - marginBottom;

  const maxCount = Math.max(...histogram.bins.map(bin => bin.count), 1);
  const binPixelWidth = plotWidth / histogram.bins.length;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#222";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(marginLeft, marginTop);
  ctx.lineTo(marginLeft, height - marginBottom);
  ctx.lineTo(width - marginRight, height - marginBottom);
  ctx.stroke();

  histogram.bins.forEach((bin, index) => {
    const barHeight = (bin.count / maxCount) * plotHeight;
    const x = marginLeft + index * binPixelWidth + 1;
    const y = height - marginBottom - barHeight;
    const w = Math.max(binPixelWidth - 2, 1);

    ctx.fillStyle = "#8fb7ff";
    ctx.fillRect(x, y, w, barHeight);
  });

  ctx.fillStyle = "#222";
  ctx.font = "12px Arial";
  ctx.fillText("Effectif", 10, marginTop + 10);
  ctx.fillText(getVariableUnit(variable), width - 50, height - 20);

  ctx.fillText("0", marginLeft - 18, height - marginBottom + 4);
  ctx.fillText(String(maxCount), marginLeft - 35, marginTop + 4);

  drawVerticalMarker(ctx, histogram, stats?.median, "#cc5500", "Méd.");
  drawVerticalMarker(ctx, histogram, stats?.mean, "#007a3d", "Moy.");

  if (isVmVariable(variable) && Number.isFinite(stats?.rms)) {
    drawVerticalMarker(ctx, histogram, stats.rms, "#7b1fa2", "RMS");
  }
}

function drawVerticalMarker(ctx, histogram, value, color, label) {
  if (!Number.isFinite(value)) return;
  if (value < histogram.graphMin || value > histogram.graphMax) return;

  const canvas = dom.histogramCanvas;
  const width = canvas.width;
  const height = canvas.height;

  const marginLeft = 70;
  const marginRight = 20;
  const marginTop = 30;
  const marginBottom = 60;

  const plotWidth = width - marginLeft - marginRight;

  const x =
    marginLeft +
    ((value - histogram.graphMin) /
      (histogram.graphMax - histogram.graphMin)) *
      plotWidth;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, marginTop);
  ctx.lineTo(x, height - marginBottom);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.font = "12px Arial";
  ctx.fillText(label, x + 4, marginTop + 12);
}

function clearCanvas() {
  const ctx = dom.histogramCanvas.getContext("2d");
  ctx.clearRect(0, 0, dom.histogramCanvas.width, dom.histogramCanvas.height);
  ctx.fillStyle = "#666";
  ctx.font = "16px Arial";
  ctx.fillText("Aucun histogramme affiché.", 30, 40);
}

