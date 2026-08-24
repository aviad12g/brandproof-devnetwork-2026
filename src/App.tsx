import { useMemo, useReducer, useState } from "react";
import {
  configureTryOn,
  extractDossier,
  fixtureMode,
  resolveConflict,
  scanMarket,
  type ApiReceipt,
  type ExtractionResult,
} from "./lib/api";
import { canPublish, initialWorkflow, readiness, transition } from "./lib/workflow.mjs";

type BusyAction = "extract" | "resolve" | "market" | "experience" | null;

const providerMeta = [
  { id: "xano", name: "Xano", role: "Governed backend" },
  { id: "nutrient", name: "Nutrient DWS", role: "Evidence extraction" },
  { id: "serpapi", name: "SerpApi", role: "Live market context" },
  { id: "perfect", name: "Perfect Corp", role: "Consumer try-on" },
] as const;

const stepMeta = [
  { id: "intake", index: "01", label: "Intake", detail: "Load product evidence" },
  { id: "review", index: "02", label: "Review", detail: "Resolve contradictions" },
  { id: "market", index: "03", label: "Market", detail: "Check current context" },
  { id: "experience", index: "04", label: "Experience", detail: "Configure try-on" },
  { id: "ready", index: "05", label: "Ready", detail: "Approve publication" },
] as const;

function Icon({ name }: { name: "arrow" | "check" | "spark" | "shield" | "search" | "eye" | "reset" }) {
  const paths = {
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    spark: <><path d="m12 3 1.1 4.1L17 9l-3.9 1.9L12 15l-1.1-4.1L7 9l3.9-1.9L12 3Z"/><path d="m18.5 14 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z"/></>,
    shield: <><path d="M12 3 5 6v5c0 4.4 2.8 7.7 7 10 4.2-2.3 7-5.6 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></>,
    search: <><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
    reset: <><path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6"/><path d="M4 4v4.6h4.6"/></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function ModePill({ mode }: { mode: ApiReceipt["mode"] | "waiting" }) {
  return <span className={`mode-pill mode-${mode}`}>{mode === "fixture" ? "Demo fixture" : mode === "live" ? "Live verified" : "Waiting"}</span>;
}

function ProductVisual({ approved }: { approved: boolean }) {
  return (
    <div className="product-visual" aria-label="Luma Veil Skin Tint product preview">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="bottle-shadow" />
      <div className="bottle">
        <div className="bottle-cap" />
        <div className="bottle-body">
          <span className="bottle-mark">LUMA</span>
          <span className="bottle-name">veil</span>
          <span className="bottle-detail">SKIN TINT · 30 ML</span>
          <span className={`bottle-spf ${approved ? "is-approved" : ""}`}>SPF {approved ? "30" : "—"}</span>
        </div>
      </div>
      <span className="shade-chip">Sunlit 04</span>
    </div>
  );
}

export default function App() {
  const [workflow, dispatch] = useReducer(transition, initialWorkflow);
  const [busy, setBusy] = useState<BusyAction>(null);
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [receipts, setReceipts] = useState<ApiReceipt[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const progress = readiness(workflow);

  const currentStepIndex = stepMeta.findIndex((item) => item.id === workflow.step);
  const providerModes = useMemo(() => {
    return Object.fromEntries(providerMeta.map((provider) => {
      const providerReceipts = receipts.filter((item) => item.provider === provider.id);
      return [provider.id, providerReceipts.at(-1)?.mode ?? "waiting"];
    }));
  }, [receipts]);

  async function runExtraction() {
    setBusy("extract");
    setError(null);
    dispatch({ type: "LOAD_DOSSIER" });
    try {
      const result = await extractDossier();
      setExtraction(result);
      setReceipts(result.receipts);
      dispatch({ type: "COMPLETE_EXTRACTION" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Evidence extraction failed.");
    } finally {
      setBusy(null);
    }
  }

  async function approveEvidence() {
    setBusy("resolve");
    setError(null);
    try {
      const receipt = await resolveConflict(30);
      setReceipts((current) => [...current, receipt]);
      dispatch({ type: "RESOLVE_CONFLICT", approvedSpf: 30 });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Review update failed.");
    } finally {
      setBusy(null);
    }
  }

  async function runMarketScan() {
    setBusy("market");
    setError(null);
    try {
      const result = await scanMarket();
      setInsights(result.insights);
      setReceipts((current) => [...current, ...result.receipts]);
      dispatch({ type: "COMPLETE_MARKET_SCAN" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Market scan failed.");
    } finally {
      setBusy(null);
    }
  }

  async function activateExperience() {
    setBusy("experience");
    setError(null);
    try {
      const newReceipts = await configureTryOn();
      setReceipts((current) => [...current, ...newReceipts]);
      dispatch({ type: "CONFIGURE_TRY_ON" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Try-on setup failed.");
    } finally {
      setBusy(null);
    }
  }

  function resetDemo() {
    dispatch({ type: "RESET" });
    setExtraction(null);
    setReceipts([]);
    setInsights([]);
    setError(null);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="BrandProof home">
          <span className="brand-glyph"><span /></span>
          <span>BrandProof</span>
        </a>
        <nav className="topnav" aria-label="Primary navigation">
          <a href="#workflow">Workflow</a>
          <a href="#evidence">Evidence</a>
          <a href="#audit">Audit trail</a>
        </nav>
        <div className="top-actions">
          <ModePill mode={fixtureMode ? "fixture" : "waiting"} />
          <button className="icon-button" onClick={resetDemo} title="Reset workflow"><Icon name="reset" /></button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="eyebrow"><span>Governed product launch</span><span className="eyebrow-line" /></div>
          <div className="hero-grid">
            <div className="hero-copy">
              <h1>Evidence to shelf.<br /><em>Without the guesswork.</em></h1>
              <p>Turn a messy beauty-product dossier into a reviewed record, current market context, and a try-on-ready consumer experience—without publishing a claim nobody verified.</p>
              <div className="hero-ctas">
                <button className="primary-button" onClick={runExtraction} disabled={busy !== null || workflow.extractionComplete}>
                  {busy === "extract" ? "Reading evidence…" : workflow.extractionComplete ? "Evidence loaded" : "Run the governed launch"}
                  <Icon name={workflow.extractionComplete ? "check" : "arrow"} />
                </button>
                <a className="text-link" href="#workflow">See how it works <span>↓</span></a>
              </div>
            </div>
            <div className="hero-preview">
              <div className="hero-metric"><span>Launch readiness</span><strong>{progress}%</strong></div>
              <ProductVisual approved={workflow.conflictResolved} />
              <div className="proof-seal"><Icon name="shield" /><span>{workflow.conflictResolved ? "Evidence approved" : "Evidence gate active"}</span></div>
            </div>
          </div>
          <div className="sponsor-strip" aria-label="Integrated providers">
            <span className="strip-label">Orchestrated through</span>
            {providerMeta.map((provider) => <span key={provider.id} className="sponsor-wordmark">{provider.name}</span>)}
          </div>
        </section>

        <section className="workflow-section" id="workflow">
          <div className="section-heading">
            <div><span className="section-kicker">The operating system</span><h2>One launch. Five governed gates.</h2></div>
            <p>Every transition is explicit. AI proposes and extracts; evidence, policy, and a human decide what moves forward.</p>
          </div>
          <div className="step-track">
            {stepMeta.map((step, index) => {
              const complete = index < currentStepIndex || workflow.step === "ready";
              const active = index === currentStepIndex && workflow.step !== "ready";
              return (
                <div key={step.id} className={`step-card ${complete ? "is-complete" : ""} ${active ? "is-active" : ""}`}>
                  <div className="step-top"><span>{complete ? <Icon name="check" /> : step.index}</span><i /></div>
                  <strong>{step.label}</strong><small>{step.detail}</small>
                </div>
              );
            })}
          </div>
        </section>

        {error && <div className="error-banner" role="alert"><strong>Action blocked.</strong> {error} <span>The app will not label an unavailable provider as live.</span></div>}

        <section className="workspace" id="evidence">
          <aside className="workspace-nav">
            <div className="workspace-title"><span className="mini-mark" /><div><strong>Luma Veil</strong><small>Launch workspace</small></div></div>
            <div className="nav-progress"><div><span>Readiness</span><strong>{progress}%</strong></div><div className="progress-rail"><span style={{ width: `${progress}%` }} /></div></div>
            <ul>
              <li className={workflow.step === "intake" ? "active" : ""}><span>01</span>Dossier</li>
              <li className={workflow.step === "review" ? "active" : ""}><span>02</span>Evidence review</li>
              <li className={workflow.step === "market" ? "active" : ""}><span>03</span>Market context</li>
              <li className={workflow.step === "experience" ? "active" : ""}><span>04</span>Consumer preview</li>
              <li className={workflow.step === "ready" ? "active" : ""}><span>05</span>Publication</li>
            </ul>
            <div className="policy-note"><Icon name="shield" /><div><strong>Policy gate</strong><span>Publishing stays blocked until every material conflict is resolved.</span></div></div>
          </aside>

          <div className="workspace-main">
            {!extraction ? (
              <div className="empty-workspace">
                <div className="document-stack"><span /><span /><span><Icon name="spark" /></span></div>
                <span className="section-kicker">Prepared sample dossier</span>
                <h3>Three source pages. One governed record.</h3>
                <p>Inspect the permission-safe product specification, marketing draft, and laboratory certificate, then run the workflow to extract their source-grounded claims.</p>
                <a className="dossier-link" href={`${import.meta.env.BASE_URL}brandproof-demo-dossier.pdf`} target="_blank" rel="noreferrer">Open synthetic source dossier<Icon name="eye" /></a>
                <button className="primary-button" onClick={runExtraction} disabled={busy !== null}>{busy === "extract" ? "Reading evidence…" : "Extract source-grounded claims"}<Icon name="arrow" /></button>
                <small className="honesty-note">Current mode: {fixtureMode ? "clearly labeled deterministic fixture" : "configured for live Xano orchestration"}.</small>
              </div>
            ) : (
              <div className="evidence-view">
                <div className="workspace-header">
                  <div><span className="section-kicker">Evidence review</span><h3>{extraction.productName}</h3><p>{extraction.category} · Shade {extraction.shade}</p></div>
                  <div className={`review-status ${workflow.conflictResolved ? "approved" : "blocked"}`}><span />{workflow.conflictResolved ? "Approved" : "1 conflict blocks publication"}</div>
                </div>
                <div className="evidence-grid">
                  <div className="claim-table">
                    <div className="table-head"><span>Verified field</span><span>Source</span><span>Confidence</span></div>
                    {extraction.claims.map((claim, index) => (
                      <div className={`claim-row ${claim.status === "conflict" && !workflow.conflictResolved ? "has-conflict" : ""}`} key={`${claim.field}-${index}`}>
                        <div><small>{claim.field}</small><strong>{claim.value}</strong></div>
                        <div><span>{claim.source}</span><small>Page {claim.page}</small></div>
                        <div><strong>{Math.round(claim.confidence * 100)}%</strong><span className="confidence-bar"><i style={{ width: `${claim.confidence * 100}%` }} /></span></div>
                      </div>
                    ))}
                  </div>
                  <div className="review-panel">
                    <div className="review-label"><span>Material conflict</span><small>Human decision required</small></div>
                    <h4>Which SPF claim governs?</h4>
                    <p>The marketing sheet says SPF 50. The laboratory certificate supports SPF 30.</p>
                    <div className="source-choice is-rejected"><span><small>Marketing sheet · p2</small><strong>SPF 50</strong></span><b>Superseded</b></div>
                    <div className={`source-choice ${workflow.conflictResolved ? "is-selected" : ""}`}><span><small>Lab certificate · p3</small><strong>SPF 30</strong></span><b>{workflow.conflictResolved ? "Approved" : "Authoritative"}</b></div>
                    <label className="reason-label">Decision reason<textarea readOnly value="Laboratory certificate governs the public claim." /></label>
                    <button className="review-button" onClick={approveEvidence} disabled={busy !== null || workflow.conflictResolved}>{busy === "resolve" ? "Recording decision…" : workflow.conflictResolved ? "Decision recorded" : "Approve SPF 30"}<Icon name="check" /></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="context-section">
          <div className="context-card market-card">
            <div className="card-icon"><Icon name="search" /></div>
            <span className="section-kicker">Current market context</span>
            <h3>Search is evidence—not truth.</h3>
            <p>BrandProof asks SerpApi for structured, current signals and routes them to a person. Search results never overwrite the verified product record.</p>
            {insights.length > 0 ? <ul className="insight-list">{insights.map((insight) => <li key={insight}><span /><p>{insight}</p></li>)}</ul> : <div className="locked-state"><span>Market scan waits for evidence approval</span></div>}
            <button className="secondary-button" onClick={runMarketScan} disabled={busy !== null || !workflow.conflictResolved || workflow.marketScanComplete}>{busy === "market" ? "Scanning structured results…" : workflow.marketScanComplete ? "Market context recorded" : "Run market scan"}<Icon name={workflow.marketScanComplete ? "check" : "arrow"} /></button>
          </div>
          <div className="context-card experience-card">
            <div className="card-icon"><Icon name="eye" /></div>
            <span className="section-kicker">Consumer experience</span>
            <h3>Try the verified shade.</h3>
            <p>The Perfect Corp experience is configured only after the source record and current market context pass review.</p>
            <div className="tryon-preview">
              <div className="face-art"><span className="face-eye left"/><span className="face-eye right"/><span className="face-mouth"/><i /></div>
              <div className="tryon-controls"><span>Sunlit 04</span><div><i/><i/><i className="selected"/><i/><i/></div><small>{workflow.tryOnConfigured ? "Session configured" : "Preview locked"}</small></div>
            </div>
            <button className="secondary-button light" onClick={activateExperience} disabled={busy !== null || !workflow.marketScanComplete || workflow.tryOnConfigured}>{busy === "experience" ? "Configuring experience…" : workflow.tryOnConfigured ? "Try-on configured" : "Configure try-on"}<Icon name={workflow.tryOnConfigured ? "check" : "arrow"} /></button>
          </div>
        </section>

        <section className="audit-section" id="audit">
          <div className="section-heading compact">
            <div><span className="section-kicker">Proof, not theater</span><h2>Every provider call leaves a receipt.</h2></div>
            <p>Resource IDs and non-secret metadata make the demo verifiable without exposing credentials or customer data.</p>
          </div>
          <div className="audit-grid">
            <div className="provider-status">
              {providerMeta.map((provider) => (
                <div className="provider-row" key={provider.id}>
                  <span className="provider-monogram">{provider.name.slice(0, 1)}</span>
                  <div><strong>{provider.name}</strong><small>{provider.role}</small></div>
                  <ModePill mode={(providerModes[provider.id] as ApiReceipt["mode"] | "waiting") ?? "waiting"} />
                </div>
              ))}
            </div>
            <div className="receipt-log">
              <div className="receipt-head"><span>Provider / operation</span><span>Resource</span><span>Status</span></div>
              {receipts.length === 0 ? <div className="no-receipts">Receipts appear after the workflow runs.</div> : receipts.map((item, index) => (
                <div className="receipt-row" key={`${item.resourceId}-${index}`}>
                  <div><strong>{item.provider}</strong><span>{item.operation}</span></div>
                  <code>{item.resourceId}</code>
                  <div className="receipt-status"><span />{item.mode === "live" ? "Live" : "Fixture"}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`publish-banner ${canPublish(workflow) ? "is-ready" : ""}`}>
          <div><span className="publish-icon"><Icon name={canPublish(workflow) ? "check" : "shield"} /></span><div><span className="section-kicker">Publication gate</span><h2>{canPublish(workflow) ? "The governed record is ready." : "Nothing publishes on confidence alone."}</h2><p>{canPublish(workflow) ? "All five workflow gates passed. A real deployment would now require an explicit operator confirmation." : "Complete the evidence, market, and experience gates to make the launch eligible for final approval."}</p></div></div>
          <button className="publish-button" disabled={!canPublish(workflow)}>{canPublish(workflow) ? "Request final approval" : `${progress}% ready`}<Icon name="arrow" /></button>
        </section>
      </main>

      <footer><a className="brand" href="#top"><span className="brand-glyph"><span /></span><span>BrandProof</span></a><p>Built from scratch for DevNetwork API + Cloud + AI Hackathon 2026.</p><span>Evidence before experience.</span></footer>
    </div>
  );
}
