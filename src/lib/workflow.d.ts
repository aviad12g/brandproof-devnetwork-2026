export type WorkflowState = {
  step: "intake" | "review" | "market" | "experience" | "ready";
  dossierLoaded: boolean;
  extractionComplete: boolean;
  conflictResolved: boolean;
  marketScanComplete: boolean;
  tryOnConfigured: boolean;
  publicationReady: boolean;
  approvedSpf: number | null;
};

export type WorkflowEvent =
  | { type: "LOAD_DOSSIER" }
  | { type: "COMPLETE_EXTRACTION" }
  | { type: "RESOLVE_CONFLICT"; approvedSpf: number }
  | { type: "COMPLETE_MARKET_SCAN" }
  | { type: "CONFIGURE_TRY_ON" }
  | { type: "RESET" };

export const STEPS: WorkflowState["step"][];
export const initialWorkflow: WorkflowState;
export function transition(state: WorkflowState, event: WorkflowEvent): WorkflowState;
export function readiness(state: WorkflowState): number;
export function canPublish(state: WorkflowState): boolean;
