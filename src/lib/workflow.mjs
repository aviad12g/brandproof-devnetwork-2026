export const STEPS = ["intake", "review", "market", "experience", "ready"];

export const initialWorkflow = Object.freeze({
  step: "intake",
  dossierLoaded: false,
  extractionComplete: false,
  conflictResolved: false,
  marketScanComplete: false,
  tryOnConfigured: false,
  publicationReady: false,
  approvedSpf: null,
});

export function transition(state, event) {
  switch (event.type) {
    case "LOAD_DOSSIER":
      return { ...state, dossierLoaded: true };
    case "COMPLETE_EXTRACTION":
      if (!state.dossierLoaded) return state;
      return { ...state, extractionComplete: true, step: "review" };
    case "RESOLVE_CONFLICT":
      if (!state.extractionComplete || ![30, 50].includes(event.approvedSpf)) return state;
      return {
        ...state,
        conflictResolved: true,
        approvedSpf: event.approvedSpf,
        step: "market",
      };
    case "COMPLETE_MARKET_SCAN":
      if (!state.conflictResolved) return state;
      return { ...state, marketScanComplete: true, step: "experience" };
    case "CONFIGURE_TRY_ON":
      if (!state.marketScanComplete) return state;
      return {
        ...state,
        tryOnConfigured: true,
        publicationReady: true,
        step: "ready",
      };
    case "RESET":
      return { ...initialWorkflow };
    default:
      return state;
  }
}

export function readiness(state) {
  const checks = [
    state.dossierLoaded,
    state.extractionComplete,
    state.conflictResolved,
    state.marketScanComplete,
    state.tryOnConfigured,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function canPublish(state) {
  return Boolean(
    state.publicationReady &&
      state.conflictResolved &&
      state.approvedSpf &&
      state.marketScanComplete &&
      state.tryOnConfigured,
  );
}
