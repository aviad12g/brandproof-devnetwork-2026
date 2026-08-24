query "brandproof/market-scan" verb=POST {
  api_group = "BrandProof"
  description = "Advance the governed workflow while SerpApi remains explicitly fixture-backed"
  input {
    int workflowId filters=min:1
  }
  stack {
    db.get "brandproof_workflow" {
      field_name = "id"
      field_value = $input.workflowId
    } as $workflow

    precondition ($workflow != null && $workflow.status == "market") {
      error_type = "inputerror"
      error = "Resolve the evidence conflict before market review"
    }

    var $insights {
      value = [
        "Comparable skin tints cluster between $34–$46."
        "Two current listings use ‘Luma’ in adjacent beauty categories."
        "Fragrance-free is prominent in 7 of the first 10 structured results."
      ]
    }

    db.edit "brandproof_workflow" {
      field_name = "id"
      field_value = $workflow.id
      data = {status: "experience", market_json: {insights: $insights, mode: "fixture"}, updated_at: now}
    } as $updated_workflow

    var $xano_receipt {
      value = {provider: "xano", operation: "agent.market_scan", mode: "live", status: "success", resourceId: "xano_market_" ~ ($workflow.id|to_text), timestamp: now}
    }
    var $serpapi_receipt {
      value = {provider: "serpapi", operation: "google_shopping.search", mode: "fixture", status: "success", resourceId: "serpapi_fixture_market", timestamp: now}
    }

    db.add "brandproof_receipt" {
      data = {workflow_id: $workflow.id, provider: "xano", operation: "agent.market_scan", mode: "live", status: "success", resource_id: $xano_receipt.resourceId, metadata: {provider_mode: "fixture"}}
    } as $receipt_row
  }
  response = {insights: $insights, receipts: [$xano_receipt, $serpapi_receipt]}
  guid = "5woxK3oKa64fMfhTZxu4Ie4hBeE"
}
