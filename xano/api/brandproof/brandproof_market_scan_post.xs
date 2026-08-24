query "brandproof/market-scan" verb=POST {
  api_group = "BrandProof"
  description = "Collect source-preserving live market evidence with SerpApi"
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

    function.run brandproof_serpapi_market_scan {
      input = {}
    } as $market_scan

    db.edit "brandproof_workflow" {
      field_name = "id"
      field_value = $workflow.id
      data = {
        status: "experience"
        market_json: {
          insights: $market_scan.insights
          evidence: $market_scan.evidence
          query: $market_scan.query
          result_count: $market_scan.resultCount
          search_id: $market_scan.searchId
          mode: "live"
        }
        updated_at: now
      }
    } as $updated_workflow

    var $xano_receipt {
      value = {provider: "xano", operation: "agent.market_scan", mode: "live", status: "success", resourceId: "xano_market_" ~ ($workflow.id|to_text), timestamp: now}
    }
    var $serpapi_receipt {
      value = {provider: "serpapi", operation: "google_shopping.search", mode: "live", status: "success", resourceId: $market_scan.searchId, timestamp: now}
    }

    db.add "brandproof_receipt" {
      data = {workflow_id: $workflow.id, provider: "serpapi", operation: "google_shopping.search", mode: "live", status: "success", resource_id: $market_scan.searchId, metadata: {query: $market_scan.query, result_count: $market_scan.resultCount}}
    } as $serpapi_receipt_row
    db.add "brandproof_receipt" {
      data = {workflow_id: $workflow.id, provider: "xano", operation: "agent.market_scan", mode: "live", status: "success", resource_id: $xano_receipt.resourceId, metadata: {provider_mode: "live", serpapi_search_id: $market_scan.searchId}}
    } as $xano_receipt_row
  }
  response = {insights: $market_scan.insights, evidence: $market_scan.evidence, receipts: [$xano_receipt, $serpapi_receipt]}
  guid = "5woxK3oKa64fMfhTZxu4Ie4hBeE"
}
