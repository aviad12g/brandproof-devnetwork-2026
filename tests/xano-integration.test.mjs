import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";


const nutrientFunctionPath = new URL("../xano/function/brandproof/nutrient_extract.xs", import.meta.url);
const extractionEndpointPath = new URL("../xano/api/brandproof/brandproof_extract_post.xs", import.meta.url);


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
  assert.match(source, /icontains:"Luma"/);
  assert.match(source, /icontains:"Veil"/);
  assert.match(source, /icontains:"Skin"/);
  assert.match(source, /icontains:"Tint"/);
  assert.doesNotMatch(source, /icontains:"Luma Veil Skin Tint"/);
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
