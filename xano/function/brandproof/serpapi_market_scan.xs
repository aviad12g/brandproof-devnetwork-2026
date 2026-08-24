function brandproof_serpapi_market_scan {
  description = "Collect and validate live Google Shopping evidence with SerpApi"
  input {
  }
  stack {
    var $query {
      value = "skin tint SPF 30 fragrance free"
    }
    precondition (($env.SERPAPI_API_KEY|strlen) > 0) {
      error_type = "inputerror"
      error = "SerpApi API key is not configured"
    }

    api.request {
      url = "https://serpapi.com/search.json"
      method = "GET"
      params = {
        engine: "google_shopping"
        q: $query
        gl: "us"
        hl: "en"
        api_key: $env.SERPAPI_API_KEY
      }
      headers = []
        |push:"Accept: application/json"
      timeout = 30
    } as $serpapi_response

    precondition ($serpapi_response.response.status == 200) {
      error_type = "inputerror"
      error = "SerpApi market request failed"
    }
    var $serpapi_body {
      value = $serpapi_response.response.result
    }
    var $search_metadata {
      value = $serpapi_body|get:"search_metadata":{}
    }
    var $shopping_results {
      value = $serpapi_body|get:"shopping_results":[]
    }
    precondition (($search_metadata|get:"status":"") == "Success") {
      error_type = "inputerror"
      error = "SerpApi search did not complete successfully"
    }
    precondition (($shopping_results|count) >= 3) {
      error_type = "inputerror"
      error = "SerpApi did not return enough shopping evidence"
    }

    var $result_0 {
      value = $shopping_results|first
    }
    var $result_1 {
      value = ($shopping_results|slice:1:1)|first
    }
    var $result_2 {
      value = ($shopping_results|slice:2:1)|first
    }
    precondition (($result_0.title|strlen) > 0 && ($result_1.title|strlen) > 0 && ($result_2.title|strlen) > 0) {
      error_type = "inputerror"
      error = "SerpApi results were missing product titles"
    }

    var $evidence {
      value = [
        {
          position: $result_0.position
          title: $result_0.title
          price: $result_0.price
          source: $result_0.source
          product_link: $result_0.product_link
        }
        {
          position: $result_1.position
          title: $result_1.title
          price: $result_1.price
          source: $result_1.source
          product_link: $result_1.product_link
        }
        {
          position: $result_2.position
          title: $result_2.title
          price: $result_2.price
          source: $result_2.source
          product_link: $result_2.product_link
        }
      ]
    }
    var $insight_0 {
      value = "Live result: " ~ $result_0.title ~ " — " ~ $result_0.price ~ " via " ~ $result_0.source
    }
    var $insight_1 {
      value = "Live result: " ~ $result_1.title ~ " — " ~ $result_1.price ~ " via " ~ $result_1.source
    }
    var $insight_2 {
      value = "Live result: " ~ $result_2.title ~ " — " ~ $result_2.price ~ " via " ~ $result_2.source
    }
    var $insights {
      value = [
        $insight_0
        $insight_1
        $insight_2
      ]
    }
  }
  response = {
    searchId: $search_metadata|get:"id":""
    query: $query
    resultCount: $shopping_results|count
    evidence: $evidence
    insights: $insights
  }
  guid = "86gdCCOsEvPoZmECJmuKgJGrcuI"
}
