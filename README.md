# BrandProof

BrandProof turns a beauty-product dossier into a governed product record, current market context, and a try-on-ready consumer experience. Material conflicts block publication until a human resolves them, and every provider action is represented by a non-secret receipt.

Built from scratch for the DevNetwork API + Cloud + AI Hackathon 2026. Implementation began on August 18, 2026, after the official August 17 kickoff and build-window opening.

## Current status

- Product UI and governed workflow: implemented.
- Permission-safe three-page synthetic source dossier: generated, render-verified, and linked from the product UI.
- Stateful Xano tables, four API endpoints, and a fail-closed Nutrient extraction function: deployed to Xano workspace `167554` and validated by the official XanoScript parser.
- Workflow tests: passing.
- Desktop and mobile visual checks: passing.
- Local browser mode uses deterministic sponsor fixtures that are unmistakably labeled `Demo fixture`; the live Xano extraction path now requires and validates a real Nutrient DWS response.
- Live sponsor calls: Xano and Nutrient are verified end to end with persisted live receipts; SerpApi and Perfect remain explicit fixtures.
- Deployment: public fixture-labeled GitHub Pages preview completed. Devpost submission is not yet completed.

The application fails honestly: if live mode is selected without a Xano API base URL, it returns an error instead of presenting fixture output as live.

## Run locally

Requirements: Node.js 22.13+ and pnpm.

```bash
pnpm install
pnpm test
pnpm validate:xano
pnpm dev
```

The checked-in sample dossier is ready to use. To regenerate it, create an isolated Python environment, install `scripts/requirements-pdf.txt`, and run `python scripts/generate_demo_dossier.py`.

The default local experience uses deterministic fixture data. Copy `.env.example` to `.env.local` only after a live Xano endpoint exists:

```bash
VITE_FIXTURE_MODE=false
VITE_XANO_API_BASE=https://your-api-group.xano.io/api:group
```

No sponsor secret belongs in the browser bundle. Xano is the server-side orchestration boundary for Nutrient, SerpApi, and Perfect credentials. Live extraction requires the Xano environment variable `NUTRIENT_API_KEY`; its value is never checked into the repository. The non-secret synthetic dossier URL is pinned in XanoScript for reproducibility.

## Verified deployment boundary

- The Xano schema and API definitions are deployed to workspace `167554` at `https://x8ki-letl-twmt.n7.xano.io/api:brandproof-2026`.
- A live extraction request returned workflow ID `1`, five claims, and persisted Xano/Nutrient success receipts. The server-side key remains secret and is not present in this repository.
- The GitHub Pages workflow publishes only the visibly labeled deterministic fixture preview. It will switch to live mode only after the live sponsor path is verified end to end.

## Governed flow

1. Open the three-page synthetic sample dossier and load it into the governed workflow.
2. Extract source-grounded claims.
3. Resolve the SPF 50 marketing claim versus the SPF 30 laboratory certificate.
4. Collect current market signals without treating search results as product truth.
5. Configure the consumer try-on only after the evidence and market gates pass.
6. Request final operator approval; the UI deliberately does not auto-publish.

## Architecture

The React/Vite client renders workflow state and calls four Xano endpoints. Xano owns the authoritative workflow, provider credentials, sponsor calls, audit receipts, and timeouts. See [docs/provider-contracts.md](docs/provider-contracts.md) for the human-readable contract and [docs/openapi.yaml](docs/openapi.yaml) for its machine-readable form.

## Verification

```bash
pnpm test
pnpm validate:xano
pnpm build
```

The unit suite proves that out-of-order transitions and unsupported approval values cannot bypass the publication gate. Browser QA covers the complete workflow on desktop, the responsive mobile layout, and an empty console.

## Safety and truthfulness

- Fixture and live modes are visible in both provider status and receipts.
- Web search is contextual evidence, never a certified product fact.
- A human must resolve material claim conflicts.
- Provider keys remain server-side.
- Paid or irreversible provider actions require a separate confirmation gate.
- Live claims are made only when corresponding response and persistence evidence exists; no completed submission is claimed yet.
