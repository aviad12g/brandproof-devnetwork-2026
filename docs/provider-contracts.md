# Provider contracts

This document freezes the client/backend boundary before sponsor authentication. It is an implementation contract, not evidence that any live sponsor call has succeeded.

## Trust boundary

The browser calls only Xano. Xano stores sponsor secrets, validates workflow state, performs provider calls, and returns a redacted receipt. The browser must never receive or log a Nutrient, SerpApi, or Perfect credential.

Every receipt has:

- `provider`: `xano`, `nutrient`, `serpapi`, or `perfect`;
- `operation`: a stable action identifier;
- `mode`: `live`, `fixture`, or `unavailable`;
- `status`: `success`, `blocked`, or `pending`;
- optional non-secret resource ID and duration;
- ISO 8601 timestamp.

## Endpoints

### `POST /brandproof/extract`

Starts a governed workflow and extracts the demo dossier. Xano calls Nutrient DWS `/build` with the public HTTPS dossier URL and requests plain text, key-value pairs, and tables as structured JSON. The backend rejects the response unless all three expected pages and both conflicting SPF claims are present. A successful response contains the product identity, typed claims, source labels and pages, confidence, conflict status, and Xano/Nutrient receipts.

Live Xano requires one server-side environment variable:

- `NUTRIENT_API_KEY`: the private DWS bearer credential;

The non-secret synthetic dossier URL is pinned in XanoScript to the public GitHub Pages PDF so the exact input remains reproducible.

### `POST /brandproof/review`

Records an explicit human decision. Required body:

```json
{
  "field": "spf",
  "approvedValue": 30,
  "reason": "Lab certificate governs public claim"
}
```

The backend must reject the decision if extraction is incomplete, the value is not present in the evidence set, or the reason is empty.

### `POST /brandproof/market-scan`

Requires the material conflict to be resolved. It returns source-preserving market insights and Xano/SerpApi receipts. Search data may inform human review but must not overwrite the verified product record.

### `POST /brandproof/try-on`

Requires completed evidence and market gates. It configures the supported Perfect experience and returns Xano/Perfect receipts. Images and session identifiers must follow the provider's published retention and consent requirements.

## Failure semantics

- `400`: malformed or unsupported input.
- `401`/`403`: authentication or challenge-access failure.
- `409`: workflow precondition failed or material conflict remains.
- `422`: provider response could not be validated.
- `429`: sponsor quota exceeded; include a retry hint only when authoritative.
- `502`/`504`: provider failure or timeout.

Errors must not silently fall back from live to fixture mode. Development fixtures are selected only by explicit configuration and remain visibly labeled throughout the interface.
