function brandproof_nutrient_extract {
  description = "Extract and validate the three-page BrandProof dossier with Nutrient DWS"
  input {
  }
  stack {
    var $dossier_url {
      value = "https://aviad12g.github.io/brandproof-devnetwork-2026/brandproof-demo-dossier.pdf"
    }
    precondition (($env.NUTRIENT_API_KEY|strlen) > 0) {
      error_type = "inputerror"
      error = "Nutrient API key is not configured"
    }
    precondition ($dossier_url|istarts_with:"https://") {
      error_type = "inputerror"
      error = "A public HTTPS dossier URL is required"
    }

    api.request {
      url = "https://api.nutrient.io/build"
      method = "POST"
      params = {
        parts: [{file: {url: $dossier_url}}]
        output: {
          type: "json-content"
          plainText: true
          structuredText: false
          keyValuePairs: true
          tables: true
        }
      }
      headers = []
        |push:"Content-Type: application/json"
        |push:("Authorization: Bearer %s"|sprintf:$env.NUTRIENT_API_KEY)
      timeout = 30
    } as $nutrient_response

    precondition ($nutrient_response.response.status == 200) {
      error_type = "inputerror"
      error = "Nutrient extraction request failed"
    }
    var $nutrient_body {
      value = $nutrient_response.response.result
    }
    var $pages {
      value = $nutrient_body|get:"pages":[]
    }
    var $product_page_json {
      value = ($pages|get:0)|json_encode
    }
    var $marketing_page_json {
      value = ($pages|get:1)|json_encode
    }
    var $laboratory_page_json {
      value = ($pages|get:2)|json_encode
    }

    precondition (($pages|count) == 3) {
      error_type = "inputerror"
      error = "Nutrient response did not contain the expected three pages"
    }
    precondition (($product_page_json|icontains:"LV-2026-004") && ($product_page_json|icontains:"Product Operations Record")) {
      error_type = "inputerror"
      error = "Nutrient response did not identify the product record"
    }
    precondition ($laboratory_page_json|icontains:"Luma Veil Skin Tint") {
      error_type = "inputerror"
      error = "Nutrient response did not identify the dossier product"
    }
    precondition (($marketing_page_json|icontains:"SPF") && ($marketing_page_json|icontains:"50")) {
      error_type = "inputerror"
      error = "Nutrient response did not extract the marketing claim"
    }
    precondition (($laboratory_page_json|icontains:"SPF") && ($laboratory_page_json|icontains:"30")) {
      error_type = "inputerror"
      error = "Nutrient response did not extract the laboratory claim"
    }
  }
  response = {
    pageCount: ($pages|count)
    productRecordFound: true
    marketingClaimFound: true
    laboratoryClaimFound: true
  }
  guid = "4UimSYfSSR49atw_bYZI4OGHEKM"
}
