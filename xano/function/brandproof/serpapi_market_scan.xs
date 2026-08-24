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
      value = $shopping_results|get:0
    }
    var $result_1 {
      value = $shopping_results|get:1
    }
    var $result_2 {
      value = $shopping_results|get:2
    }
    precondition ((($result_0|get:"title":"")|strlen) > 0 && (($result_1|get:"title":"")|strlen) > 0 && (($result_2|get:"title":"")|strlen) > 0) {
      error_type = "inputerror"
      error = "SerpApi results were missing product titles"
    }

    var $evidence {
      value = [
        {
          position: $result_0|get:"position":1
          title: $result_0|get:"title":""
          price: $result_0|get:"price":"Price unavailable"
          source: $result_0|get:"source":"Source unavailable"
          product_link: $result_0|get:"product_link":""
        }
        {
          position: $result_1|get:"position":2
          title: $result_1|get:"title":""
          price: $result_1|get:"price":"Price unavailable"
          source: $result_1|get:"source":"Source unavailable"
          product_link: $result_1|get:"product_link":""
        }
        {
          position: $result_2|get:"position":3
          title: $result_2|get:"title":""
          price: $result_2|get:"price":"Price unavailable"
          source: $result_2|get:"source":"Source unavailable"
          product_link: $result_2|get:"product_link":""
        }
      ]
    }
    var $insights {
      value = [
        "Live result: " ~ ($evidence|get:0|get:"title":"") ~ " — " ~ ($evidence|get:0|get:"price":"") ~ " via " ~ ($evidence|get:0|get:"source":"")
        "Live result: " ~ ($evidence|get:1|get:"title":"") ~ " — " ~ ($evidence|get:1|get:"price":"") ~ " via " ~ ($evidence|get:1|get:"source":"")
        "Live result: " ~ ($evidence|get:2|get:"title":"") ~ " — " ~ ($evidence|get:2|get:"price":"") ~ " via " ~ ($evidence|get:2|get:"source":"")
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
