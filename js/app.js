const dom = {};
let histogramChart = null;
let exportPngChart = null;
let tooltipPinned = false;
let pinnedTooltipIndex = null;

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
  dom.sampleCsvSelect = document.getElementById("sample-csv-select");
  dom.loadSampleBtn = document.getElementById("load-sample-btn");
  dom.newFileBtn = document.getElementById("new-file-btn");
  dom.downloadSampleLink = document.getElementById("download-sample-link");

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
  dom.tooltipPinCheckbox = document.getElementById("tooltip-pin-checkbox");
  dom.panLeftBtn = document.getElementById("pan-left-btn");
  dom.panRightBtn = document.getElementById("pan-right-btn");
  dom.zoomInBtn = document.getElementById("zoom-in-btn");
  dom.zoomOutBtn = document.getElementById("zoom-out-btn");
  dom.zoomYInBtn = document.getElementById("zoom-y-in-btn");
  dom.zoomYOutBtn = document.getElementById("zoom-y-out-btn");
  dom.resetYBtn = document.getElementById("reset-y-btn");
  dom.resetGraphBtn = document.getElementById("reset-graph-btn");
  dom.exportPngBtn = document.getElementById("export-png-btn");

  dom.graphTitle = document.getElementById("graph-title");
  dom.graphSource = document.getElementById("graph-source");
  dom.graphAnalysisMeta = document.getElementById("graph-analysis-meta");
  dom.graphMarkersLegend = document.getElementById("graph-markers-legend");
  dom.graphExportMeta = document.getElementById("graph-export-meta");
  dom.graphAnalysedCount = document.getElementById("graph-analysed-count");
  dom.graphVisibleCount = document.getElementById("graph-visible-count");
  dom.graphHiddenCount = document.getElementById("graph-hidden-count");
  dom.graphUnit = document.getElementById("graph-unit");
  dom.graphBreak20 = document.getElementById("graph-break-20");

  dom.exportPngHiddenBlock = document.getElementById("export-png-hidden-block");
  dom.exportPngTitle = document.getElementById("export-png-title");
  dom.exportPngMode = document.getElementById("export-png-mode");
  dom.exportPngMin = document.getElementById("export-png-min");
  dom.exportPngMax = document.getElementById("export-png-max");
  dom.exportPngClasses = document.getElementById("export-png-classes");
  dom.exportPngClassWidth = document.getElementById("export-png-class-width");

  dom.exportPngGraphTitle = document.getElementById("export-png-graph-title");
  dom.exportPngGraphSource = document.getElementById("export-png-graph-source");
  dom.exportPngGraphAnalysisMeta = document.getElementById("export-png-graph-analysis-meta");
  dom.exportPngGraphMarkersLegend = document.getElementById("export-png-graph-markers-legend");
  dom.exportPngGraphExportMeta = document.getElementById("export-png-graph-export-meta");

  dom.exportPngAnalysedCount = document.getElementById("export-png-analysed-count");
  dom.exportPngVisibleCount = document.getElementById("export-png-visible-count");
  dom.exportPngHiddenCount = document.getElementById("export-png-hidden-count");
  dom.exportPngUnit = document.getElementById("export-png-unit");
  dom.exportPngBreak20 = document.getElementById("export-png-break-20");

  dom.exportPngCanvas = document.getElementById("export-png-canvas");

  dom.histogramCanvas = document.getElementById("histogram-canvas");
}

function bindEvents() {
  dom.fileInput.addEventListener("change", onFileSelected);
  dom.loadSampleBtn.addEventListener("click", onLoadSampleClicked);
  dom.newFileBtn.addEventListener("click", onNewFile);
  dom.sampleCsvSelect.addEventListener("change", updateSampleDownloadLink);

  dom.applyFiltersBtn.addEventListener("click", handleUiChange);
  dom.resetFiltersBtn.addEventListener("click", onResetFilters);

  dom.graphModeSelect.addEventListener("change", handleGraphChange);
  dom.graphMinInput.addEventListener("change", handleGraphChange);
  dom.graphMaxInput.addEventListener("change", handleGraphChange);
  dom.graphClassesInput.addEventListener("change", handleGraphChange);
  dom.tooltipPinCheckbox.addEventListener("change", onTooltipPinChange);
  dom.panLeftBtn.addEventListener("click", onPanLeft);
  dom.panRightBtn.addEventListener("click", onPanRight);
  dom.zoomInBtn.addEventListener("click", onZoomIn);
  dom.zoomOutBtn.addEventListener("click", onZoomOut);
  dom.zoomYInBtn.addEventListener("click", onZoomYIn);
  dom.zoomYOutBtn.addEventListener("click", onZoomYOut);
  dom.resetYBtn.addEventListener("click", onResetYAxis);
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
  dom.graphMarkersLegend.innerHTML = "—";
  dom.graphExportMeta.textContent = "—";
  dom.graphAnalysedCount.textContent = "—";
  dom.graphVisibleCount.textContent = "—";
  dom.graphHiddenCount.textContent = "—";
  dom.graphUnit.textContent = "—";
  dom.graphClassWidthOutput.textContent = "—";
  dom.graphBreak20.textContent = "—";

  dom.exportPngTitle.textContent = "Histogramme";
  dom.exportPngMode.textContent = "—";
  dom.exportPngMin.textContent = "—";
  dom.exportPngMax.textContent = "—";
  dom.exportPngClasses.textContent = "—";
  dom.exportPngClassWidth.textContent = "—";

  dom.exportPngGraphTitle.textContent = "—";
  dom.exportPngGraphSource.textContent = "—";
  dom.exportPngGraphAnalysisMeta.textContent = "—";
  dom.exportPngGraphMarkersLegend.innerHTML = "—";
  dom.exportPngGraphExportMeta.textContent = "—";

  dom.exportPngAnalysedCount.textContent = "—";
  dom.exportPngVisibleCount.textContent = "—";
  dom.exportPngHiddenCount.textContent = "—";
  dom.exportPngUnit.textContent = "—";
  dom.exportPngBreak20.textContent = "—";
  
  if (dom.tooltipPinCheckbox) {
    dom.tooltipPinCheckbox.checked = false;
  }
  tooltipPinned = false;
  pinnedTooltipIndex = null;
  
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

async function onLoadSampleClicked() {
  clearMessages();

  const samplePath = dom.sampleCsvSelect.value;
  if (!samplePath) {
    dom.importError.textContent = "Aucun exemple CSV sélectionné.";
    return;
  }

  try {
    const response = await fetch(samplePath, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Chargement impossible (${response.status}).`);
    }

    const csvText = await response.text();
    const sampleName = samplePath.split("/").pop() || "Exemple CSV";

    loadAndAnalyze(csvText, sampleName);
  } catch (error) {
    dom.importError.textContent =
      error.message || "Impossible de charger le fichier d’exemple.";
  }
}

function updateSampleDownloadLink() {
  if (!dom.downloadSampleLink) {
    return;
  }

  const samplePath = dom.sampleCsvSelect?.value || "";

  if (!samplePath) {
    dom.downloadSampleLink.setAttribute("href", "#");
    dom.downloadSampleLink.setAttribute("aria-disabled", "true");
    dom.downloadSampleLink.removeAttribute("download");
    return;
  }

  const fileName = samplePath.split("/").pop() || "exemple.csv";

  dom.downloadSampleLink.setAttribute("href", samplePath);
  dom.downloadSampleLink.setAttribute("download", fileName);
  dom.downloadSampleLink.setAttribute("aria-disabled", "false");
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

    tooltipPinned = false;
    pinnedTooltipIndex = null;
    if (dom.tooltipPinCheckbox) {
      dom.tooltipPinCheckbox.checked = false;
    }

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
  updateSampleDownloadLink();
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

  if (isAuto) {
    dom.graphMinInput.value = "";
    dom.graphMaxInput.value = "";
    appState.graph.min = null;
    appState.graph.max = null;
  }

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

  appState.graph.yDisplayMax = null;

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

function buildGraphMarkersLegend(stats, variable) {
  if (!stats || !Number.isFinite(stats.count) || stats.count === 0) {
    return "Repères statistiques : —";
  }

  const unit = getVariableUnit(variable);
  const parts = [
    `<span class="marker-label marker-label-median">Médiane : ${formatStatValue(stats.median, unit)}</span>`,
    `<span class="marker-label marker-label-mean">Moyenne : ${formatStatValue(stats.mean, unit)}</span>`
  ];

  if (
    variable === "ratioCasA_CasB" &&
    Number.isFinite(stats.percentCasASuperieurCasB)
  ) {
    parts.push(
      `<span class="marker-label marker-label-casa-superieur">% Cas A > Cas B : ${formatStatValue(stats.percentCasASuperieurCasB, "%")}</span>`
    );
  }

  if (isVmVariable(variable) && Number.isFinite(stats.rms)) {
    parts.push(
      `<span class="marker-label marker-label-rms">RMS : ${formatStatValue(stats.rms, unit)}</span>`
    );
  }

  return parts.join(" | ");
}

function computeBreakAt20(histogram) {
  if (!histogram || !histogram.bins || histogram.bins.length < 2) {
    return null;
  }

  const target = 20;
  let beforeBin = null;
  let at20Bin = null;

  histogram.bins.forEach(bin => {
    const isBefore20 = bin.x1 <= target;
    const contains20 = bin.x0 <= target && target < bin.x1;
    const startsAt20 = bin.x0 === target;

    if (isBefore20) {
      if (!beforeBin || bin.x1 > beforeBin.x1) {
        beforeBin = bin;
      }
    }

    if (contains20 || startsAt20) {
      if (!at20Bin || bin.x0 < at20Bin.x0) {
        at20Bin = bin;
      }
    }
  });

  if (!beforeBin || !at20Bin) {
    return null;
  }

  if (beforeBin.count <= 0) {
    return null;
  }

  const dropPercent =
    ((beforeBin.count - at20Bin.count) / beforeBin.count) * 100;

  return {
    beforeLabel: `[${formatNumber(beforeBin.x0, 3)} ; ${formatNumber(beforeBin.x1, 3)}[`,
    at20Label: `[${formatNumber(at20Bin.x0, 3)} ; ${formatNumber(at20Bin.x1, 3)}[`,
    beforeCount: beforeBin.count,
    at20Count: at20Bin.count,
    dropPercent
  };
}

function updateHiddenExportBlock(histogram, stats, breakAt20) {
  dom.exportPngTitle.textContent = "Histogramme";

  dom.exportPngMode.textContent =
    appState.graph.mode === "auto" ? "Automatique" : "Manuel";

  dom.exportPngMin.textContent =
    histogram && Number.isFinite(histogram.graphMin)
      ? formatNumber(histogram.graphMin, 3)
      : "—";

  dom.exportPngMax.textContent =
    histogram && Number.isFinite(histogram.graphMax)
      ? formatNumber(histogram.graphMax, 3)
      : "—";

  dom.exportPngClasses.textContent = Number.isFinite(appState.graph.nbClasses)
    ? String(appState.graph.nbClasses)
    : "—";

  dom.exportPngClassWidth.textContent =
    histogram && histogram.classWidth != null
      ? formatNumber(histogram.classWidth, 3)
      : "—";

  dom.exportPngGraphTitle.textContent = dom.graphTitle.textContent;
  dom.exportPngGraphSource.textContent = dom.graphSource.textContent;
  dom.exportPngGraphAnalysisMeta.textContent = dom.graphAnalysisMeta.textContent;
  dom.exportPngGraphMarkersLegend.innerHTML = dom.graphMarkersLegend.innerHTML;
  dom.exportPngGraphExportMeta.textContent = dom.graphExportMeta.textContent;

  dom.exportPngAnalysedCount.textContent = dom.graphAnalysedCount.textContent;
  dom.exportPngVisibleCount.textContent = dom.graphVisibleCount.textContent;
  dom.exportPngHiddenCount.textContent = dom.graphHiddenCount.textContent;
  dom.exportPngUnit.textContent = dom.graphUnit.textContent;
  dom.exportPngBreak20.textContent = dom.graphBreak20.textContent;
}

function renderAnalysisPreview() {
  const stats = appState.results.stats;
  const histogram = appState.results.histogram;
  const breakAt20 = computeBreakAt20(histogram);

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
    dom.graphMarkersLegend.innerHTML = buildGraphMarkersLegend(
    stats,
    appState.analyse.variable
  );
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
  dom.graphBreak20.textContent = breakAt20
    ? `avant : ${breakAt20.beforeCount} | classe 20 % : ${breakAt20.at20Count} | chute : ${formatNumber(breakAt20.dropPercent, 1)} %`
    : "Non calculable";

  updateHiddenExportBlock(histogram, stats, breakAt20);
  drawHistogramPreview(histogram, stats, appState.analyse.variable);
  drawExportPngHistogram(histogram, stats, appState.analyse.variable);
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
  const showPercentCasASuperieurCasB = variable === "ratioCasA_CasB";

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
      <span class="stat-label">Mediane</span>
      <span class="stat-value">${formatStatValue(stats.median, unit)}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Moyenne</span>
      <span class="stat-value">${formatStatValue(stats.mean, unit)}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">P90</span>
      <span class="stat-value">${formatStatValue(stats.p90, unit)}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">P95</span>
      <span class="stat-value">${formatStatValue(stats.p95, unit)}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">P98</span>
      <span class="stat-value">${formatStatValue(stats.p98, unit)}</span>
    </div>
    ${
      showPercentCasASuperieurCasB
        ? `
    <div class="stat-card">
      <span class="stat-label">% Cas A > Cas B</span>
      <span class="stat-value">${formatStatValue(stats.percentCasASuperieurCasB, "%")}</span>
    </div>
    `
        : ""
    }
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

  parts.push(
    `Période : ${appState.filters.anneeMin ?? "—"}–${appState.filters.anneeMax ?? "—"}`
  );

  if (appState.filters.lieuMesure === "interieur") {
    parts.push("Lieu : En intérieur");
  } else if (appState.filters.lieuMesure === "exterieur") {
    parts.push("Lieu : En extérieur");
  } else {
    parts.push("Lieu : Indifférent");
  }

  parts.push(
    `Environnement : ${
      appState.filters.environnement === "tous"
        ? "Tous"
        : appState.filters.environnement
    }`
  );

  parts.push(
    `Laboratoire : ${
      appState.filters.laboratoire === "tous"
        ? "Tous"
        : appState.filters.laboratoire
    }`
  );

  if (appState.filters.casB === "exists") {
    parts.push("Cas B : existe");
  } else if (appState.filters.casB === "missing") {
    parts.push("Cas B : n’existe pas");
  } else {
    parts.push("Cas B : Indifférent");
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

function onTooltipPinChange() {
  tooltipPinned = dom.tooltipPinCheckbox.checked;

  if (!tooltipPinned) {
    pinnedTooltipIndex = null;

    if (histogramChart) {
      histogramChart.setActiveElements([]);
      if (histogramChart.tooltip) {
        histogramChart.tooltip.setActiveElements([], { x: 0, y: 0 });
      }
      histogramChart.update();
    }
  }
}

function hidePinnedTooltip() {
  pinnedTooltipIndex = null;

  if (!histogramChart) {
    return;
  }

  histogramChart.setActiveElements([]);

  if (histogramChart.tooltip) {
    histogramChart.tooltip.setActiveElements([], { x: 0, y: 0 });
  }

  histogramChart.update();
}

function showPinnedTooltip(index) {
  if (!histogramChart) {
    return;
  }

  const meta = histogramChart.getDatasetMeta(0);
  const barElement = meta?.data?.[index];

  if (!barElement) {
    return;
  }

  const position = barElement.getCenterPoint();

  histogramChart.setActiveElements([
    { datasetIndex: 0, index }
  ]);

  if (histogramChart.tooltip) {
    histogramChart.tooltip.setActiveElements(
      [{ datasetIndex: 0, index }],
      position
    );
  }

  histogramChart.update();
}

function onResetFilters() {
  resetFiltersToDefault();
  syncStateToControls();

  if (appState.data.length > 0) {
    handleUiChange();
  }
}

function onPanLeft() {
  panHistogram(-0.25);
}

function onPanRight() {
  panHistogram(0.25);
}

function panHistogram(relativeShift) {
  clearMessages();

  if (!appState.results.values || appState.results.values.length === 0) {
    dom.graphMessage.textContent = "Aucune valeur exploitable pour déplacer l’affichage.";
    return;
  }

  const currentHistogram = appState.results.histogram;
  if (
    !currentHistogram ||
    !Number.isFinite(currentHistogram.graphMin) ||
    !Number.isFinite(currentHistogram.graphMax)
  ) {
    dom.graphError.textContent = "Plage de graphique indisponible.";
    return;
  }

  const values = appState.results.values.filter(value => Number.isFinite(value));
  if (values.length === 0) {
    dom.graphMessage.textContent = "Aucune valeur exploitable pour déplacer l’affichage.";
    return;
  }

  const baseRange = getDefaultGraphRangeForZoom(values, appState.analyse.variable);

  const currentMin = currentHistogram.graphMin;
  const currentMax = currentHistogram.graphMax;
  const span = currentMax - currentMin;

  if (!(span > 0)) {
    dom.graphError.textContent = "Plage de déplacement invalide.";
    return;
  }

  const shift = span * relativeShift;

  let newMin = currentMin + shift;
  let newMax = currentMax + shift;

  if (newMin < baseRange.min) {
    newMin = baseRange.min;
    newMax = newMin + span;
  }

  if (newMax > baseRange.max) {
    newMax = baseRange.max;
    newMin = newMax - span;
  }

  newMin = Math.max(newMin, baseRange.min);
  newMax = Math.min(newMax, baseRange.max);

  if (!(newMax > newMin)) {
    dom.graphError.textContent = "Impossible de déplacer l’affichage.";
    return;
  }

  appState.graph.mode = "manual";
  appState.graph.min = newMin;
  appState.graph.max = newMax;

  syncStateToControls();
  updateGraphModeUi();

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
      error.message || "Erreur pendant le déplacement de l’affichage.";
  }
}

function onZoomIn() {
  zoomHistogram(0.5);
}

function onZoomOut() {
  zoomHistogram(2);
}

function zoomHistogram(factor) {
  clearMessages();

  if (!appState.results.values || appState.results.values.length === 0) {
    dom.graphMessage.textContent = "Aucune valeur exploitable pour appliquer un zoom.";
    return;
  }

  const currentHistogram = appState.results.histogram;
  if (
    !currentHistogram ||
    !Number.isFinite(currentHistogram.graphMin) ||
    !Number.isFinite(currentHistogram.graphMax)
  ) {
    dom.graphError.textContent = "Plage de graphique indisponible.";
    return;
  }

  const values = appState.results.values.filter(value => Number.isFinite(value));
  if (values.length === 0) {
    dom.graphMessage.textContent = "Aucune valeur exploitable pour appliquer un zoom.";
    return;
  }

  const baseRange = getDefaultGraphRangeForZoom(values, appState.analyse.variable);

  const currentMin = currentHistogram.graphMin;
  const currentMax = currentHistogram.graphMax;
  const currentSpan = currentMax - currentMin;

  if (!(currentSpan > 0)) {
    dom.graphError.textContent = "Plage de zoom invalide.";
    return;
  }

  const center = (currentMin + currentMax) / 2;
  let newSpan = currentSpan * factor;

  const minSpan = Math.max((baseRange.max - baseRange.min) / 1000, 0.0001);
  const maxSpan = baseRange.max - baseRange.min;

  newSpan = Math.max(newSpan, minSpan);
  newSpan = Math.min(newSpan, maxSpan);

  let newMin = center - newSpan / 2;
  let newMax = center + newSpan / 2;

  if (newMin < baseRange.min) {
    newMin = baseRange.min;
    newMax = newMin + newSpan;
  }

  if (newMax > baseRange.max) {
    newMax = baseRange.max;
    newMin = newMax - newSpan;
  }

  newMin = Math.max(newMin, baseRange.min);
  newMax = Math.min(newMax, baseRange.max);

  if (!(newMax > newMin)) {
    dom.graphError.textContent = "Impossible d’appliquer le zoom.";
    return;
  }

  appState.graph.mode = "manual";
  appState.graph.min = newMin;
  appState.graph.max = newMax;

  syncStateToControls();
  updateGraphModeUi();

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
      error.message || "Erreur pendant l’application du zoom.";
  }
}

function getDefaultGraphRangeForZoom(values, variable) {
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

function onZoomYIn() {
  zoomYAxis(0.85);
}

function onZoomYOut() {
  zoomYAxis(1 / 0.85);
}

function onResetYAxis() {
  appState.graph.yDisplayMax = null;
  renderAnalysisPreview();
}

function zoomYAxis(factor) {
  clearMessages();

  const histogram = appState.results.histogram;
  if (!histogram || !histogram.bins || histogram.bins.length === 0) {
    dom.graphMessage.textContent = "Aucun histogramme disponible pour appliquer un zoom vertical.";
    return;
  }

  const referenceMax = getReferenceHistogramMaxCount(
    appState.results.values,
    appState.analyse.variable,
    histogram.nbClasses
  );

  const currentMax = Number.isFinite(appState.graph.yDisplayMax)
    ? appState.graph.yDisplayMax
    : referenceMax;

  let newMax = currentMax * factor;

  const minAllowedMax = Math.max(referenceMax * 0.001, 0.2);
  const maxAllowedMax = referenceMax;

  newMax = Math.max(newMax, minAllowedMax);
  newMax = Math.min(newMax, maxAllowedMax);

  appState.graph.yDisplayMax = newMax;

  renderAnalysisPreview();
}

function onResetGraph() {
  resetGraphToDefault();
  appState.graph.yDisplayMax = null;
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
  dom.sampleCsvSelect.value = "";
  renderEmptyState();
}

function onExportPng() {
  dom.graphMessage.textContent =
    "L’export PNG sera branché après le rendu du graphique.";
}

function getVariableLabel(variable) {
  if (variable === "niveauGlobal") return "Exposition Cas A";
  if (variable === "cumulCasB") return "Cumul Cas B";
  if (variable === "ratioCasA_CasB") return "Cohérence (Cas A - Cas B) / Cas A";
  return "Grandeur inconnue";
}

function getVariableUnit(variable) {
  if (variable === "ratioCasA_CasB") return "%";
  return "V/m";
}

function getVariableAxisLabel(variable) {
  if (variable === "ratioCasA_CasB") {
    return "(Cas A - Cas B) / Cas A en %";
  }
  return getVariableUnit(variable);
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

function createHistogramMarkersPlugin(stats, histogram, variable) {
  return {
    id: "histogramMarkersPlugin",
    afterDatasetsDraw(chart) {
      if (!stats || !histogram) return;
      if (!Number.isFinite(histogram.graphMin) || !Number.isFinite(histogram.graphMax)) return;
      if (!(histogram.graphMax > histogram.graphMin)) return;

      const { ctx, chartArea } = chart;
      if (!chartArea) return;

      const markers = [
        {
          value: stats.median,
          color: "#cc5500"
        },
        {
          value: stats.mean,
          color: "#007a3d"
        }
      ];

      if (isVmVariable(variable) && Number.isFinite(stats?.rms)) {
        markers.push({
          value: stats.rms,
          color: "#7b1fa2"
        });
      }

      ctx.save();
      ctx.lineWidth = 2;

      markers.forEach(marker => {
        if (!Number.isFinite(marker.value)) return;
        if (marker.value < histogram.graphMin || marker.value > histogram.graphMax) return;

        const x =
          chartArea.left +
          ((marker.value - histogram.graphMin) /
            (histogram.graphMax - histogram.graphMin)) *
            chartArea.width;

        ctx.strokeStyle = marker.color;
        ctx.beginPath();
        ctx.moveTo(x, chartArea.top);
        ctx.lineTo(x, chartArea.bottom);
        ctx.stroke();
      });

      ctx.restore();
    }
  };
}

function getReferenceHistogramMaxCount(values, variable, nbClasses) {
  const cleanValues = values.filter(value => Number.isFinite(value));

  if (cleanValues.length === 0) {
    return 1;
  }

  const defaultRange = getDefaultGraphRangeForZoom(cleanValues, variable);

  const referenceHistogram = computeHistogram(
    cleanValues,
    {
      mode: "manual",
      min: defaultRange.min,
      max: defaultRange.max,
      nbClasses
    },
    variable
  );

  const maxCount = Math.max(
    ...referenceHistogram.bins.map(bin => bin.count),
    1
  );

  return maxCount;
}

function drawHistogramPreview(histogram, stats, variable) {
  const previousPinnedIndex = tooltipPinned ? pinnedTooltipIndex : null;

  destroyHistogramChart();

  const canvas = dom.histogramCanvas;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!histogram || !histogram.bins || histogram.bins.length === 0) {
    ctx.fillStyle = "#666";
    ctx.font = "16px Arial";
    ctx.fillText("Aucune donnée à afficher.", 30, 40);
    return;
  }

  const unit = getVariableUnit(variable);

  const labels = histogram.bins.map((bin, index) => {
    const min = formatNumber(bin.x0, 3);
    const max = formatNumber(bin.x1, 3);
    const isLastBin = index === histogram.bins.length - 1;

    return isLastBin ? `[${min} ; ${max}]` : `[${min} ; ${max}[`;
  });

  const data = histogram.bins.map(bin => bin.count);

  const referenceYAxisMax = getReferenceHistogramMaxCount(
    appState.results.values,
    variable,
    histogram.nbClasses
  );
  
  const visibleMaxCount = Math.max(...data, 0);
  const defaultYAxisMax = Math.max(referenceYAxisMax * 1.08, visibleMaxCount * 1.08);
  
  const yAxisMax = Number.isFinite(appState.graph.yDisplayMax)
    ? appState.graph.yDisplayMax
    : defaultYAxisMax;

  histogramChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Effectif",
          data,
          backgroundColor: "rgba(143, 183, 255, 0.75)",
          borderColor: "rgba(143, 183, 255, 1)",
          borderWidth: 1,
          barPercentage: 1.0,
          categoryPercentage: 1.0
        }
      ]
    },
    plugins: [createHistogramMarkersPlugin(stats, histogram, variable)],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      onClick(event, elements, chart) {
        if (!tooltipPinned) {
          return;
        }

        if (!elements || elements.length === 0) {
          return;
        }

        const clickedIndex = elements[0].index;

        if (pinnedTooltipIndex === clickedIndex) {
          hidePinnedTooltip();
          return;
        }

        pinnedTooltipIndex = clickedIndex;
        showPinnedTooltip(clickedIndex);
      },
      plugins: {
        legend: {
          display: false
        },
                tooltip: {
          enabled: true,
          callbacks: {
            title(items) {
              if (!items || items.length === 0) return "";
              return `Classe ${items[0].label} ${unit}`;
            },
            label(context) {
              const count = context.raw;
              const totalVisible = histogram.visibleCount || 0;
              const percent =
                totalVisible > 0 ? ((count / totalVisible) * 100).toFixed(2) : "0.00";

              return [
                `Effectif : ${count}`,
                `Fréquence : ${percent} %`
              ];
            }
          },
          external(context) {
            if (!tooltipPinned || pinnedTooltipIndex == null) {
              return;
            }

            const tooltip = context.tooltip;

            if (!tooltip) {
              return;
            }

            if (tooltip.opacity === 0) {
              showPinnedTooltip(pinnedTooltipIndex);
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: getVariableAxisLabel(variable)
          },
          ticks: {
            autoSkip: true,
            maxTicksLimit: 12,
            maxRotation: 0,
            minRotation: 0
          },
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          max: yAxisMax,
          title: {
            display: true,
            text: "Effectif"
          },
          ticks: {
            precision: 0
          }
        }
      }
    }
  });

  if (
    tooltipPinned &&
    previousPinnedIndex != null &&
    histogram.bins &&
    previousPinnedIndex >= 0 &&
    previousPinnedIndex < histogram.bins.length
  ) {
    pinnedTooltipIndex = previousPinnedIndex;
    showPinnedTooltip(previousPinnedIndex);
  } else if (!tooltipPinned) {
    pinnedTooltipIndex = null;
  } else if (
    pinnedTooltipIndex != null &&
    (!histogram.bins || pinnedTooltipIndex >= histogram.bins.length)
  ) {
    pinnedTooltipIndex = null;
  }
  
  if (visibleMaxCount > yAxisMax) {
    dom.graphMessage.textContent =
      "Attention : l’échelle verticale est amplifiée. Une ou plusieurs colonnes dépassent la hauteur affichée.";
  }
}

function drawExportPngHistogram(histogram, stats, variable) {
  destroyExportPngChart();

  const canvas = dom.exportPngCanvas;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!histogram || !histogram.bins || histogram.bins.length === 0) {
    ctx.fillStyle = "#666";
    ctx.font = "16px Arial";
    ctx.fillText("Aucune donnée à afficher.", 30, 40);
    return;
  }

  const unit = getVariableUnit(variable);

  const labels = histogram.bins.map((bin, index) => {
    const min = formatNumber(bin.x0, 3);
    const max = formatNumber(bin.x1, 3);
    const isLastBin = index === histogram.bins.length - 1;

    return isLastBin ? `[${min} ; ${max}]` : `[${min} ; ${max}[`;
  });

  const data = histogram.bins.map(bin => bin.count);

  const referenceYAxisMax = getReferenceHistogramMaxCount(
    appState.results.values,
    variable,
    histogram.nbClasses
  );

  const visibleMaxCount = Math.max(...data, 0);
  const defaultYAxisMax = Math.max(referenceYAxisMax * 1.08, visibleMaxCount * 1.08);

  const yAxisMax = Number.isFinite(appState.graph.yDisplayMax)
    ? appState.graph.yDisplayMax
    : defaultYAxisMax;

  exportPngChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Effectif",
          data,
          backgroundColor: "rgba(143, 183, 255, 0.75)",
          borderColor: "rgba(143, 183, 255, 1)",
          borderWidth: 1,
          barPercentage: 1.0,
          categoryPercentage: 1.0
        }
      ]
    },
    plugins: [createHistogramMarkersPlugin(stats, histogram, variable)],
    options: {
      responsive: false,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: getVariableAxisLabel(variable)
          },
          ticks: {
            autoSkip: true,
            maxTicksLimit: 12,
            maxRotation: 0,
            minRotation: 0
          },
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          max: yAxisMax,
          title: {
            display: true,
            text: "Effectif"
          },
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
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

function destroyHistogramChart() {
  if (histogramChart) {
    histogramChart.destroy();
    histogramChart = null;
  }
}

function destroyExportPngChart() {
  if (exportPngChart) {
    exportPngChart.destroy();
    exportPngChart = null;
  }
}

function clearCanvas() {
  destroyHistogramChart();
  destroyExportPngChart();

  const ctx = dom.histogramCanvas.getContext("2d");
  ctx.clearRect(0, 0, dom.histogramCanvas.width, dom.histogramCanvas.height);
  ctx.fillStyle = "#666";
  ctx.font = "16px Arial";
  ctx.fillText("Aucun histogramme affiché.", 30, 40);

  const exportCtx = dom.exportPngCanvas.getContext("2d");
  exportCtx.clearRect(0, 0, dom.exportPngCanvas.width, dom.exportPngCanvas.height);
  exportCtx.fillStyle = "#666";
  exportCtx.font = "16px Arial";
  exportCtx.fillText("Aucun histogramme affiché.", 30, 40);
}

