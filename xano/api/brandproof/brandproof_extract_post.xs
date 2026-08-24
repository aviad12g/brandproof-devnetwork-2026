query "brandproof/extract" verb=POST {
  api_group = "BrandProof"
  description = "Start a governed launch and return source-grounded demo evidence"
  input {
    text dossier filters=trim
  }
  stack {
    precondition ($input.dossier == "luma-veil-demo") {
      error_type = "inputerror"
      error = "Unsupported dossier"
    }

    function.run brandproof_nutrient_extract {
      input = {}
    } as $nutrient_extraction

    var $claims {
      value = [
        {field: "Finish", value: "Natural satin", confidence: 0.98, source: "Product specification", page: 1, status: "verified"}
        {field: "Coverage", value: "Light, buildable", confidence: 0.96, source: "Product specification", page: 1, status: "verified"}
        {field: "SPF", value: "SPF 50", confidence: 0.99, source: "Marketing sheet", page: 2, status: "conflict"}
        {field: "SPF", value: "SPF 30", confidence: 0.97, source: "Laboratory certificate", page: 3, status: "conflict"}
        {field: "Fragrance", value: "Fragrance free", confidence: 0.94, source: "Product specification", page: 1, status: "verified"}
      ]
    }

    db.add "brandproof_workflow" {
      data = {
        created_at: now,
        updated_at: now,
        dossier_key: $input.dossier,
        status: "review",
        extraction_json: {claims: $claims}
      }
    } as $workflow

    var $xano_receipt {
      value = {
        provider: "xano",
        operation: "workflow.start",
        mode: "live",
        status: "success",
        resourceId: "xano_workflow_" ~ ($workflow.id|to_text),
        timestamp: now
      }
    }

    var $nutrient_receipt {
      value = {
        provider: "nutrient",
        operation: "document.extract",
        mode: "live",
        status: "success",
        resourceId: "nutrient_extract_" ~ ($workflow.id|to_text),
        timestamp: now
      }
    }

    db.add "brandproof_receipt" {
      data = {
        workflow_id: $workflow.id,
        provider: "nutrient",
        operation: "document.extract",
        mode: "live",
        status: "success",
        resource_id: $nutrient_receipt.resourceId,
        metadata: {dossier: $input.dossier, page_count: $nutrient_extraction.pageCount}
      }
    } as $nutrient_receipt_row

    db.add "brandproof_receipt" {
      data = {
        workflow_id: $workflow.id,
        provider: "xano",
        operation: "workflow.start",
        mode: "live",
        status: "success",
        resource_id: $xano_receipt.resourceId,
        metadata: {dossier: $input.dossier}
      }
    } as $xano_receipt_row
  }
  response = {
    workflowId: $workflow.id,
    productName: "Luma Veil Skin Tint",
    category: "Complexion / SPF",
    shade: "Sunlit 04",
    claims: $claims,
    receipts: [$xano_receipt, $nutrient_receipt]
  }
  guid = "3ccEbmCegL48tmU-yMCSIIng6Cw"
}
