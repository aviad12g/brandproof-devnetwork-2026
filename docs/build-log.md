# Public build log

## August 18, 2026 — eligible implementation begins

- Confirmed that the official build window had opened before creating application code.
- Re-audited the live sponsor page and froze the focused scope: Xano backend, Nutrient evidence, SerpApi market context, and Perfect consumer try-on.
- Created a new repository and implemented the React/Vite/TypeScript product shell from scratch.
- Implemented the governed state machine, material-conflict review, publication gate, provider receipts, and explicit fixture/live status.
- Added deterministic workflow tests; all three pass.
- Produced a successful production build.
- Completed desktop, mobile, and full-interaction browser checks with no console warnings or errors.

Live sponsor authentication, API calls, deployment, public repository publication, video production, and Devpost submission remain pending and are not claimed as complete.

## August 19, 2026 — contract and reproducibility

- Rechecked the official Devpost overview, Updates page, and rules. No sponsor brief or deadline changed; the live participant count increased from 720 to 762.
- Added a least-privilege GitHub Actions workflow for locked dependency installation, tests, and production build.
- Added a machine-readable OpenAPI contract for the four planned Xano endpoints, including workflow preconditions and explicit provider-failure semantics.
- Xano authentication remains the first unavoidable account-bound gate. No live endpoint is claimed.

## August 20, 2026 — stateful Xano backend prepared

- Rechecked the official overview and Updates page. The sponsor slate and deadline are unchanged; the participant count is now 793.
- Implemented two Xano tables for governed workflow state and non-secret provider receipts.
- Implemented four Xano endpoints for extraction, human review, market context, and try-on configuration.
- Updated the client to preserve and submit the live Xano workflow ID across every state transition.
- Validated all seven XanoScript files with the official XanoScript parser: 7 valid, 0 invalid, 0 warnings.
- Xano endpoints remain local and unpushed until account authentication and a required dry-run preview are available. Nutrient, SerpApi, and Perfect responses remain visibly fixture-mode.

## August 22, 2026 — source evidence packet

- Created a three-page synthetic PDF dossier containing a product specification, a conflicting marketing draft, and an authoritative laboratory certificate.
- Labeled every page as synthetic, non-product, and without regulatory approval; no proprietary or personal source material is included.
- Rendered and visually inspected all three pages, verified extractable text and metadata, and linked the packet directly from the application.
- Updated fixture and XanoScript source citations to match the packet's exact page numbers.
- Xano authentication and all live sponsor calls remain pending and are not claimed as complete.

## August 23, 2026 — Nutrient live-path implementation

- Confirmed the event-published Nutrient campaign gateway is active; a separate Nutrient account sign-in and private API key are still required.
- Added a server-side Xano function that calls Nutrient DWS `/build` against the public dossier URL and requests plain text, key-value pairs, and tables.
- Made the live extraction path fail closed unless Nutrient returns the expected three pages and extracts both the SPF 50 marketing claim and SPF 30 laboratory claim.
- Kept the browser's deterministic fixture mode explicit and separate; no live Nutrient call is claimed until the Xano environment is authenticated and execution evidence is captured.

## August 24, 2026 — authenticated deployment boundary

- Authenticated the Xano CLI to instance `x8ki-letl-twmt`, workspace `167554`.
- Reviewed a create-only dry run, then pushed two tables, one function, one API group, and four endpoints transactionally.
- Verified the live extraction URL returns a fail-closed `400` when the private Nutrient key is absent; no workflow row or fake live receipt is created.
- Published the public repository and a visibly fixture-labeled GitHub Pages preview; both the preview and synthetic dossier return HTTP 200.
- Pinned the non-secret public dossier URL in XanoScript, leaving `NUTRIENT_API_KEY` as the only requirement for the first real sponsor call.

## August 24, 2026 — first live document workflow

- Stored the Nutrient DWS credential only in Xano and made seven controlled three-page calls while correcting the response wrapper, array access, and evidence checks.
- Used one temporary diagnostic response containing only the public synthetic dossier extraction to bind validation to the actual page structure, then removed the diagnostic payload.
- Verified HTTP `200` with workflow ID `1`, five claims, and live Xano/Nutrient success receipts.
- Independently queried Xano live tables and confirmed one workflow in `review` state, the five-claim extraction payload, and two persisted receipts.
- Verified `29/50` Nutrient free-plan credits remain. SerpApi and Perfect are still fixtures and are not represented as live.

## August 24, 2026 — remaining sponsor paths prepared

- Verified the SerpApi account email, then stopped at its required phone-number and 6-digit-code gate. Implemented and deployed a server-side Google Shopping function and market endpoint; the missing-key test returned `400` and created no market receipt.
- Resolved the synthetic evidence conflict to the laboratory-supported SPF 30 value. Xano now persists workflow `1` in `market` state plus a live review receipt.
- Generated a completely fictional, permission-safe 800×800 portrait for Perfect Corp, published it with the fixture preview, and verified the public JPEG returns HTTP `200`.
- Implemented and deployed a Perfect AI Look flow that lists templates, creates a task, polls to a terminal state, and rejects anything except a successful HTTPS render.
- Seven tests, all ten XanoScript files, the production build, CI, and Pages pass. SerpApi and Perfect are not claimed live until their credentials and provider responses are verified.
