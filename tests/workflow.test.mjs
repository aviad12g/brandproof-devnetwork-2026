import assert from "node:assert/strict";
import test from "node:test";
import { canPublish, initialWorkflow, readiness, transition } from "../src/lib/workflow.mjs";

test("workflow blocks out-of-order transitions", () => {
  const unchanged = transition(initialWorkflow, { type: "RESOLVE_CONFLICT", approvedSpf: 30 });
  assert.deepEqual(unchanged, initialWorkflow);
  assert.equal(canPublish(unchanged), false);
});

test("workflow reaches publication only after all governed gates", () => {
  let state = transition(initialWorkflow, { type: "LOAD_DOSSIER" });
  state = transition(state, { type: "COMPLETE_EXTRACTION" });
  state = transition(state, { type: "RESOLVE_CONFLICT", approvedSpf: 30 });
  state = transition(state, { type: "COMPLETE_MARKET_SCAN" });
  assert.equal(canPublish(state), false);
  state = transition(state, { type: "CONFIGURE_TRY_ON" });
  assert.equal(canPublish(state), true);
  assert.equal(readiness(state), 100);
});

test("invalid approved values do not clear the evidence conflict", () => {
  let state = transition(initialWorkflow, { type: "LOAD_DOSSIER" });
  state = transition(state, { type: "COMPLETE_EXTRACTION" });
  state = transition(state, { type: "RESOLVE_CONFLICT", approvedSpf: 45 });
  assert.equal(state.conflictResolved, false);
  assert.equal(readiness(state), 40);
});
