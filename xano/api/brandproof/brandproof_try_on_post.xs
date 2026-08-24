query "brandproof/try-on" verb=POST {
  api_group = "BrandProof"
  description = "Create and persist a live Perfect Corp AI Look virtual try-on"
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

    function.run brandproof_perfect_look_vto {
      input = {}
    } as $tryon

    db.edit "brandproof_workflow" {
      field_name = "id"
      field_value = $workflow.id
      data = {
        status: "ready"
        tryon_json: {
          shade: "Sunlit 04"
          mode: "live"
          task_id: $tryon.taskId
          task_status: $tryon.taskStatus
          template_id: $tryon.templateId
          template_title: $tryon.templateTitle
          source_image_url: $tryon.sourceImageUrl
          result_url: $tryon.resultUrl
        }
        updated_at: now
      }
    } as $updated_workflow

    var $xano_receipt {
      value = {provider: "xano", operation: "experience.configure", mode: "live", status: "success", resourceId: "xano_experience_" ~ ($workflow.id|to_text), timestamp: now}
    }
    var $perfect_receipt {
      value = {provider: "perfect", operation: "look_vto.task", mode: "live", status: "success", resourceId: $tryon.taskId, timestamp: now}
    }

    db.add "brandproof_receipt" {
      data = {workflow_id: $workflow.id, provider: "perfect", operation: "look_vto.task", mode: "live", status: "success", resource_id: $tryon.taskId, metadata: {template_id: $tryon.templateId, template_title: $tryon.templateTitle, task_status: $tryon.taskStatus}}
    } as $perfect_receipt_row
    db.add "brandproof_receipt" {
      data = {workflow_id: $workflow.id, provider: "xano", operation: "experience.configure", mode: "live", status: "success", resource_id: $xano_receipt.resourceId, metadata: {provider_mode: "live", perfect_task_id: $tryon.taskId}}
    } as $xano_receipt_row
  }
  response = {
    resultUrl: $tryon.resultUrl
    sourceImageUrl: $tryon.sourceImageUrl
    templateId: $tryon.templateId
    templateTitle: $tryon.templateTitle
    receipts: [$xano_receipt, $perfect_receipt]
  }
  guid = "bZ18TmCHRNvWnr2UrlUdNuVcp58"
}
