import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";


const nutrientFunctionPath = new URL("../xano/function/brandproof/nutrient_extract.xs", import.meta.url);
const serpapiFunctionPath = new URL("../xano/function/brandproof/serpapi_market_scan.xs", import.meta.url);
const perfectFunctionPath = new URL("../xano/function/brandproof/perfect_look_vto.xs", import.meta.url);
const extractionEndpointPath = new URL("../xano/api/brandproof/brandproof_extract_post.xs", import.meta.url);
const marketEndpointPath = new URL("../xano/api/brandproof/brandproof_market_scan_post.xs", import.meta.url);
const tryOnEndpointPath = new URL("../xano/api/brandproof/brandproof_try_on_post.xs", import.meta.url);


test("Nutrient integration is server-side, live, and fail-closed", async () => {
  const source = await readFile(nutrientFunctionPath, "utf8");

  assert.match(source, /https:\/\/api\.nutrient\.io\/build/);
  assert.match(source, /\$env\.NUTRIENT_API_KEY/);
  assert.match(source, /https:\/\/aviad12g\.github\.io\/brandproof-devnetwork-2026\/brandproof-demo-dossier\.pdf/);
  assert.doesNotMatch(source, /\$env\.BRANDPROOF_DOSSIER_URL/);
  assert.match(source, /\$nutrient_response\.response\.status == 200/);
  assert.match(source, /\$nutrient_response\.response\.result/);
  assert.doesNotMatch(source, /\$nutrient_response\|get:"pages"/);
  assert.match(source, /\(\$pages\|get:0\)\|json_encode/);
  assert.match(source, /\(\$pages\|get:1\)\|json_encode/);
  assert.match(source, /\(\$pages\|get:2\)\|json_encode/);
  assert.doesNotMatch(source, /get:"[012]\.plainText"/);
  assert.doesNotMatch(source, /\|get:"plainText"/);
  assert.match(source, /\(\$pages\|count\) == 3/);
  assert.match(source, /\$product_page_json\|icontains:"LV-2026-004"/);
  assert.match(source, /\$product_page_json\|icontains:"Product Operations Record"/);
  assert.match(source, /\$laboratory_page_json\|icontains:"Luma Veil Skin Tint"/);
  assert.doesNotMatch(source, /payload = \$nutrient_body/);
  assert.match(source, /\$marketing_page_json\|icontains:"SPF"/);
  assert.match(source, /\$marketing_page_json\|icontains:"50"/);
  assert.match(source, /\$laboratory_page_json\|icontains:"SPF"/);
  assert.match(source, /\$laboratory_page_json\|icontains:"30"/);
  assert.doesNotMatch(source, /Bearer\s+(?!%s)[A-Za-z0-9_-]{20,}/);
});


test("extraction endpoint records Nutrient only after the live function returns", async () => {
  const source = await readFile(extractionEndpointPath, "utf8");

  const callIndex = source.indexOf("function.run brandproof_nutrient_extract");
  const liveReceiptIndex = source.indexOf('provider: "nutrient"');
  assert.ok(callIndex >= 0, "live Nutrient function must be called");
  assert.ok(liveReceiptIndex > callIndex, "live receipt must be created after the provider call");
  assert.match(source, /operation: "document\.extract",\s*mode: "live"/s);
  assert.doesNotMatch(source, /nutrient_fixture_dossier/);
});


test("SerpApi integration is server-side, live, and persisted after validation", async () => {
  const [providerSource, endpointSource] = await Promise.all([
    readFile(serpapiFunctionPath, "utf8"),
    readFile(marketEndpointPath, "utf8"),
  ]);

  assert.match(providerSource, /https:\/\/serpapi\.com\/search\.json/);
  assert.match(providerSource, /engine: "google_shopping"/);
  assert.match(providerSource, /\$env\.SERPAPI_API_KEY/);
  assert.match(providerSource, /\$serpapi_response\.response\.status == 200/);
  assert.match(providerSource, /\$serpapi_response\.response\.result/);
  assert.match(providerSource, /\$search_metadata\|get:"status":""\) == "Success"/);
  assert.match(providerSource, /\(\$shopping_results\|count\) >= 3/);
  assert.match(providerSource, /value = \$shopping_results\|first/);
  assert.match(providerSource, /title: \$result_0\.title/);
  assert.match(providerSource, /value = \[\s*\$insight_0\s+\$insight_1\s+\$insight_2\s*\]/s);
  assert.doesNotMatch(providerSource, /\$result_[012]\|get:"title"/);
  assert.doesNotMatch(providerSource, /api_key:\s*"[^"]+"/);

  const callIndex = endpointSource.indexOf("function.run brandproof_serpapi_market_scan");
  const liveReceiptIndex = endpointSource.indexOf('provider: "serpapi"');
  assert.ok(callIndex >= 0, "live SerpApi function must be called");
  assert.ok(liveReceiptIndex > callIndex, "live receipt must be created after the provider call");
  assert.match(endpointSource, /operation: "google_shopping\.search", mode: "live"/);
  assert.doesNotMatch(endpointSource, /serpapi_fixture_market/);
  assert.doesNotMatch(endpointSource, /mode: "fixture"/);
});


test("Perfect Corp integration creates and verifies a live try-on task", async () => {
  const [providerSource, endpointSource] = await Promise.all([
    readFile(perfectFunctionPath, "utf8"),
    readFile(tryOnEndpointPath, "utf8"),
  ]);

  assert.match(providerSource, /https:\/\/yce-api-01\.makeupar\.com\/s2s\/v2\.0\/task\/template\/look-vto/);
  assert.match(providerSource, /https:\/\/yce-api-01\.makeupar\.com\/s2s\/v2\.0\/task\/look-vto/);
  assert.match(providerSource, /perfect-demo-face\.jpg/);
  assert.match(providerSource, /\$env\.PERFECT_API_KEY/);
  assert.match(providerSource, /\$task_status == "success"/);
  assert.match(providerSource, /\$result_url\|istarts_with:"https:\/\/"/);
  assert.doesNotMatch(providerSource, /Bearer\s+(?!%s)[A-Za-z0-9_-]{20,}/);

  const callIndex = endpointSource.indexOf("function.run brandproof_perfect_look_vto");
  const liveReceiptIndex = endpointSource.indexOf('provider: "perfect"');
  assert.ok(callIndex >= 0, "live Perfect function must be called");
  assert.ok(liveReceiptIndex > callIndex, "live receipt must be created after task completion");
  assert.match(endpointSource, /operation: "look_vto\.task", mode: "live"/);
  assert.doesNotMatch(endpointSource, /perfect_fixture_session/);
  assert.doesNotMatch(endpointSource, /mode: "fixture"/);
});
