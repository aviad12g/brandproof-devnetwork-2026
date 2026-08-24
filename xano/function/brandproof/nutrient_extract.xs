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
    var $product_page {
      value = $pages|get:0|get:"plainText":""
    }
    var $marketing_page {
      value = $pages|get:1|get:"plainText":""
    }
    var $laboratory_page {
      value = $pages|get:2|get:"plainText":""
    }

    precondition (($pages|count) == 3) {
      error_type = "inputerror"
      error = "Nutrient response did not contain the expected three pages"
    }
    precondition ($product_page|icontains:"Luma Veil Skin Tint") {
      error_type = "inputerror"
      error = "Nutrient response did not identify the product record"
    }
    precondition ($marketing_page|icontains:"SPF 50") {
      error_type = "inputerror"
      error = "Nutrient response did not extract the marketing claim"
    }
    precondition ($laboratory_page|icontains:"SPF 30") {
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
