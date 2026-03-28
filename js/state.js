const appState = {
  sourceName: "",
  rawCsvText: "",
  columns: [],
  data: [],
  filterOptions: {
    years: { min: null, max: null },
    lieuxMesure: [],
    environnements: [],
    laboratoires: []
  },
  filters: {
    anneeMin: null,
    anneeMax: null,
    lieuMesure: "indifferent",
    environnement: "tous",
    laboratoire: "tous",
    casB: "indifferent",
    seuilCasAActif: true,
    seuilCasA: 0.1
  },
  analyse: {
    variable: "niveauGlobal"
  },
  graph: {
    mode: "auto",
    min: null,
    max: null,
    nbClasses: 20
  },
  results: {
    filteredRows: [],
    validRows: [],
    values: [],
    stats: null,
    histogram: null,
    counters: {
      totalRows: 0,
      filteredRowsCount: 0,
      thresholdExcludedCount: 0,
      invalidExcludedCount: 0,
      validRowsCount: 0
    }
  }
};

function resetFiltersToDefault() {
  appState.filters = {
    anneeMin: appState.filterOptions.years.min,
    anneeMax: appState.filterOptions.years.max,
    lieuMesure: "indifferent",
    environnement: "tous",
    laboratoire: "tous",
    casB: "indifferent",
    seuilCasAActif: true,
    seuilCasA: 0.1
  };

  appState.analyse.variable = "niveauGlobal";
}

function resetGraphToDefault() {
  appState.graph = {
    mode: "auto",
    min: null,
    max: null,
    nbClasses: 20
  };
}

function resetState() {
  appState.sourceName = "";
  appState.rawCsvText = "";
  appState.columns = [];
  appState.data = [];
  appState.filterOptions = {
    years: { min: null, max: null },
    lieuxMesure: [],
    environnements: [],
    laboratoires: []
  };
  appState.results = {
    filteredRows: [],
    validRows: [],
    values: [],
    stats: null,
    histogram: null,
    counters: {
      totalRows: 0,
      filteredRowsCount: 0,
      thresholdExcludedCount: 0,
      invalidExcludedCount: 0,
      validRowsCount: 0
    }
  };

  resetFiltersToDefault();
  resetGraphToDefault();
}
