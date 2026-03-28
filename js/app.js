const dom = {};

document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
  resetState();
  cacheDomReferences();
  bindEvents();
  renderEmptyState();
}

function cacheDomReferences() {
  dom.workspace = document.getElementById("workspace");
  dom.graphSection = document.getElementById("graph-section");

  dom.fileInput = document.getElementById("csv-file-input");
  dom.dropZone = document.getElementById("drop-zone");
  dom.csvTextInput = document.getElementById("csv-text-input");
  dom.analyzePastedCsvBtn = document.getElementById("analyze-pasted-csv-btn");
  dom.loadAnalyzeBtn = document.getElementById("load-analyze-btn");
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
  dom.analyzePastedCsvBtn.addEventListener("click", onPastedCsvAnalyze);
  dom.loadAnalyzeBtn.addEventListener("click", onLoadAnalyzeClicked);
  dom.newFileBtn.addEventListener("click", onNewFile);

  dom.applyFiltersBtn.addEventListener("click", handleUiChange);
  dom.resetFiltersBtn.addEventListener("click", onResetFilters);

  dom.graphModeSelect.addEventListener("change", handleGraphChange);
  dom.graphMinInput.addEventListener("change", handleGraphChange);
  dom.graphMaxInput.addEventListener("change", handleGraphChange);
  dom.graphClassesInput.addEventListener("change", handleGraphChange);
  dom.resetGraphBtn.addEventListener("click", onResetGraph);

  dom.exportPngBtn.addEventListener("click", onExportPng);

  dom.dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
  });

  dom.dropZone.addEventListener("drop", async (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    await loadFile(file);
  });
}

function renderEmptyState() {
  dom.workspace.classList.add("hidden");
  dom.graphSection.classList.add("hidden");

  dom.sourceName.textContent = "Source : —";
  dom.sourceRowCount.textContent = "Lignes : —";
  dom.sourcePeriod.textContent = "Période : —";

  clearMessages();
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

async function onLoadAnalyzeClicked() {
  const file = dom.fileInput.files?.[0];
  if (!file) {
    dom.importError.textContent = "Aucun fichier CSV sélectionné.";
    return;
  }
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

function onPastedCsvAnalyze() {
  clearMessages();

  const csvText = dom.csvTextInput.value.trim();
  if (!csvText) {
    dom.importError.textContent = "Le contenu CSV collé est vide.";
    return;
  }

  loadAndAnalyze(csvText, "CSV collé");
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
    syncStateToControls();
    renderLoadedStub(parseResult);
  } catch (error) {
    renderEmptyState();
    dom.importError.textContent = error.message || "Erreur de parsing du fichier CSV.";
  }
}

function renderLoadedStub(parseResult) {
  showLoadedLayout();
  populateDynamicFilterControls();
  resetFiltersToDefault();
  syncStateToControls();
  updateFilteredPreview(parseResult);
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
  dom.casbSelect.value = appState.filters.casB;
  dom.casaThresholdEnabled.checked = appState.filters.seuilCasAActif;
  dom.casaThresholdInput.value = appState.filters.seuilCasA;
  dom.analysisVariableSelect.value = appState.analyse.variable;

  dom.graphModeSelect.value = appState.graph.mode;
  dom.graphMinInput.value = appState.graph.min ?? "";
  dom.graphMaxInput.value = appState.graph.max ?? "";
  dom.graphClassesInput.value = appState.graph.nbClasses;
}

function syncControlsToState() {
  appState.filters.anneeMin = dom.yearMinInput.value === "" ? null : Number(dom.yearMinInput.value);
  appState.filters.anneeMax = dom.yearMaxInput.value === "" ? null : Number(dom.yearMaxInput.value);
  appState.filters.lieuMesure = dom.measureLocationSelect.value;
  appState.filters.environnement = dom.environmentSelect.value || "tous";
  appState.filters.laboratoire = dom.laboratorySelect.value || "tous";
  appState.filters.casB = dom.casbSelect.value;
  appState.filters.seuilCasAActif = dom.casaThresholdEnabled.checked;
  appState.filters.seuilCasA = Number(dom.casaThresholdInput.value);

  appState.analyse.variable = dom.analysisVariableSelect.value;

  appState.graph.mode = dom.graphModeSelect.value;
  appState.graph.min = dom.graphMinInput.value === "" ? null : Number(dom.graphMinInput.value);
  appState.graph.max = dom.graphMaxInput.value === "" ? null : Number(dom.graphMaxInput.value);
  appState.graph.nbClasses = Number(dom.graphClassesInput.value);
}

function handleUiChange() {
  clearMessages();
  syncControlsToState();

  if (!appState.data.length) {
    dom.analysisError.textContent = "Aucune donnée chargée.";
    return;
  }

  const filteredRows = applyUserFilters(appState.data, appState.filters);

  appState.results.filteredRows = filteredRows;
  appState.results.counters.totalRows = appState.data.length;
  appState.results.counters.filteredRowsCount = filteredRows.length;
  appState.results.counters.thresholdExcludedCount = 0;
  appState.results.counters.invalidExcludedCount = 0;
  appState.results.counters.validRowsCount = 0;

  renderAnalysisPreview();
}

function updateFilteredPreview(parseResult) {
  const periodText =
    appState.filterOptions.years.min != null && appState.filterOptions.years.max != null
      ? `${appState.filterOptions.years.min} – ${appState.filterOptions.years.max}`
      : "—";

  dom.sourceName.textContent = `Source : ${appState.sourceName || "—"}`;
  dom.sourceRowCount.textContent = `Lignes : ${appState.data.length}`;
  dom.sourcePeriod.textContent = `Période : ${periodText}`;

  appState.results.filteredRows = appState.data.slice();
  appState.results.counters.totalRows = appState.data.length;
  appState.results.counters.filteredRowsCount = appState.data.length;
  appState.results.counters.thresholdExcludedCount = 0;
  appState.results.counters.invalidExcludedCount = 0;
  appState.results.counters.validRowsCount = 0;

  dom.importMessage.textContent =
    `Fichier chargé avec succès. ${appState.data.length} lignes normalisées` +
    (parseResult.invalidRowCount > 0 ? `, ${parseResult.invalidRowCount} lignes ignorées.` : ".");

  renderAnalysisPreview();
}

function renderAnalysisPreview() {
  dom.summaryTotalRows.textContent = String(appState.results.counters.totalRows);
  dom.summaryFilteredRows.textContent = String(appState.results.counters.filteredRowsCount);
  dom.summaryThresholdExcluded.textContent = String(appState.results.counters.thresholdExcludedCount);
  dom.summaryInvalidExcluded.textContent = String(appState.results.counters.invalidExcludedCount);
  dom.summaryValidValues.textContent = String(appState.results.counters.validRowsCount);

  dom.activeFiltersSummary.textContent = buildActiveFiltersText();

  dom.statsCards.innerHTML = `
    <div class="stat-card">
      <span class="stat-label">Statut</span>
      <span class="stat-value">Filtres métier appliqués</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Lignes retenues</span>
      <span class="stat-value">${appState.results.counters.filteredRowsCount}</span>
    </div>
  `;

  dom.analysisMessage.textContent =
    appState.results.counters.filteredRowsCount > 0
      ? "Filtres métier appliqués. La validité analytique et les statistiques seront branchées à l’étape suivante."
      : "Aucune mesure ne correspond aux filtres sélectionnés.";

  dom.graphTitle.textContent = "Histogramme — —";
  dom.graphSource.textContent = `Source : ${appState.sourceName || "—"}`;
  dom.graphAnalysisMeta.textContent = `Sous-ensemble après filtres : ${appState.results.counters.filteredRowsCount}`;
  dom.graphExportMeta.textContent = "Statistiques Mesures Cartoradio";
  dom.graphAnalysedCount.textContent = "0";
  dom.graphVisibleCount.textContent = "0";
  dom.graphHiddenCount.textContent = "0";
  dom.graphUnit.textContent = "—";
  dom.graphClassWidthOutput.textContent = "—";

  clearCanvas();
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
    `Période : ${appState.filters.anneeMin ?? "—"} – ${appState.filters.anneeMax ?? "—"}`,
    `Lieu : ${lieuText}`,
    `Environnement : ${appState.filters.environnement === "tous" ? "Tous" : appState.filters.environnement}`,
    `Laboratoire : ${appState.filters.laboratoire === "tous" ? "Tous" : appState.filters.laboratoire}`,
    `Cas B : ${casBText}`,
    `Seuil Cas A : ${seuilText}`,
    `Grandeur : ${dom.analysisVariableSelect.options[dom.analysisVariableSelect.selectedIndex]?.textContent || "—"}`
  ].join(" | ");
}

function handleGraphChange() {
  syncControlsToState();
  dom.graphMessage.textContent = "Le moteur d’histogramme sera branché à l’étape suivante.";
}

function onResetFilters() {
  resetFiltersToDefault();
  syncStateToControls();
  handleUiChange();
}

function onResetGraph() {
  resetGraphToDefault();
  syncStateToControls();
  dom.graphMessage.textContent = "Affichage du graphique réinitialisé.";
  clearCanvas();
}

function onNewFile() {
  resetState();
  dom.fileInput.value = "";
  dom.csvTextInput.value = "";
  renderEmptyState();
}

function onExportPng() {
  dom.graphMessage.textContent = "L’export PNG sera branché après le rendu du graphique.";
}

function clearCanvas() {
  const ctx = dom.histogramCanvas.getContext("2d");
  ctx.clearRect(0, 0, dom.histogramCanvas.width, dom.histogramCanvas.height);
  ctx.fillStyle = "#666";
  ctx.font = "16px Arial";
  ctx.fillText("Aucun histogramme affiché.", 30, 40);
}

