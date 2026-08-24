query "brandproof/review" verb=POST {
  api_group = "BrandProof"
  description = "Record a human evidence decision and advance the workflow"
  input {
    int workflowId filters=min:1
    text field filters=trim
    int approvedValue filters=min:1|max:100
    text reason filters=trim
  }
  stack {
    db.get "brandproof_workflow" {
      field_name = "id"
      field_value = $input.workflowId
    } as $workflow

    precondition ($workflow != null && $workflow.status == "review") {
      error_type = "inputerror"
      error = "Workflow is not awaiting evidence review"
    }
    precondition ($input.field == "spf" && ($input.approvedValue == 30 || $input.approvedValue == 50)) {
      error_type = "inputerror"
      error = "Unsupported evidence decision"
    }
    precondition (($input.reason|strlen) > 0) {
      error_type = "inputerror"
      error = "A decision reason is required"
    }

    db.edit "brandproof_workflow" {
      field_name = "id"
      field_value = $workflow.id
      data = {approved_spf: $input.approvedValue, status: "market", updated_at: now}
    } as $updated_workflow

    var $resource_id { value = "xano_review_" ~ ($workflow.id|to_text) }
    db.add "brandproof_receipt" {
      data = {
        workflow_id: $workflow.id,
        provider: "xano",
        operation: "review.resolve",
        mode: "live",
        status: "success",
        resource_id: $resource_id,
        metadata: {field: $input.field, approvedValue: $input.approvedValue, reason: $input.reason}
      }
    } as $receipt_row
  }
  response = {
    provider: "xano",
    operation: "review.resolve",
    mode: "live",
    status: "success",
    resourceId: $resource_id,
    timestamp: now
  }
  guid = "cTlHhpILLrnzVOVRMbPES_fiaz0"
}
