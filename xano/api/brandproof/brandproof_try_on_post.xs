query "brandproof/try-on" verb=POST {
  api_group = "BrandProof"
  description = "Complete the governed workflow while Perfect remains explicitly fixture-backed"
  input {
    int workflowId filters=min:1
  }
  stack {
    db.get "brandproof_workflow" {
      field_name = "id"
      field_value = $input.workflowId
    } as $workflow

    precondition ($workflow != null && $workflow.status == "experience") {
      error_type = "inputerror"
      error = "Complete market review before configuring try-on"
    }

    db.edit "brandproof_workflow" {
      field_name = "id"
      field_value = $workflow.id
      data = {status: "ready", tryon_json: {shade: "Sunlit 04", mode: "fixture"}, updated_at: now}
    } as $updated_workflow

    var $xano_receipt {
      value = {provider: "xano", operation: "experience.configure", mode: "live", status: "success", resourceId: "xano_experience_" ~ ($workflow.id|to_text), timestamp: now}
    }
    var $perfect_receipt {
      value = {provider: "perfect", operation: "try_on.session", mode: "fixture", status: "success", resourceId: "perfect_fixture_session", timestamp: now}
    }

    db.add "brandproof_receipt" {
      data = {workflow_id: $workflow.id, provider: "xano", operation: "experience.configure", mode: "live", status: "success", resource_id: $xano_receipt.resourceId, metadata: {provider_mode: "fixture"}}
    } as $receipt_row
  }
  response = [$xano_receipt, $perfect_receipt]
  guid = "bZ18TmCHRNvWnr2UrlUdNuVcp58"
}
