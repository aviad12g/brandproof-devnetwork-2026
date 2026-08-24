function brandproof_perfect_look_vto {
  description = "Create and verify a live Perfect Corp AI Look virtual try-on"
  input {
  }
  stack {
    var $source_image_url {
      value = "https://aviad12g.github.io/brandproof-devnetwork-2026/perfect-demo-face.jpg"
    }
    precondition (($env.PERFECT_API_KEY|strlen) > 0) {
      error_type = "inputerror"
      error = "Perfect Corp API key is not configured"
    }

    api.request {
      url = "https://yce-api-01.makeupar.com/s2s/v2.0/task/template/look-vto"
      method = "GET"
      params = {page_size: 20}
      headers = []
        |push:"Accept: application/json"
        |push:("Authorization: Bearer %s"|sprintf:$env.PERFECT_API_KEY)
      timeout = 30
    } as $template_response

    precondition ($template_response.response.status == 200) {
      error_type = "inputerror"
      error = "Perfect Corp template request failed"
    }
    var $template_body {
      value = $template_response.response.result
    }
    var $template_data {
      value = $template_body|get:"data":{}
    }
    var $templates {
      value = $template_data|get:"templates":[]
    }
    precondition (($templates|count) > 0) {
      error_type = "inputerror"
      error = "Perfect Corp returned no look templates"
    }
    var $template {
      value = $templates|get:0
    }
    var $template_id {
      value = $template|get:"id":""
    }
    precondition (($template_id|strlen) > 0) {
      error_type = "inputerror"
      error = "Perfect Corp template was missing an ID"
    }

    api.request {
      url = "https://yce-api-01.makeupar.com/s2s/v2.0/task/look-vto"
      method = "POST"
      params = {src_file_url: $source_image_url, template_id: $template_id}
      headers = []
        |push:"Content-Type: application/json"
        |push:("Authorization: Bearer %s"|sprintf:$env.PERFECT_API_KEY)
      timeout = 30
    } as $task_response

    precondition ($task_response.response.status == 200) {
      error_type = "inputerror"
      error = "Perfect Corp try-on task request failed"
    }
    var $task_body {
      value = $task_response.response.result
    }
    var $task_data {
      value = $task_body|get:"data":{}
    }
    var $task_id {
      value = $task_data|get:"task_id":""
    }
    precondition (($task_id|strlen) > 0) {
      error_type = "inputerror"
      error = "Perfect Corp did not return a task ID"
    }

    var $task_status {
      value = "pending"
    }
    var $result_url {
      value = ""
    }
    for (18) {
      each as $attempt {
        util.sleep {
          value = 1
        }
        api.request {
          url = "https://yce-api-01.makeupar.com/s2s/v2.0/task/look-vto/" ~ $task_id
          method = "GET"
          params = {}
          headers = []
            |push:"Accept: application/json"
            |push:("Authorization: Bearer %s"|sprintf:$env.PERFECT_API_KEY)
          timeout = 30
        } as $poll_response
        precondition ($poll_response.response.status == 200) {
          error_type = "inputerror"
          error = "Perfect Corp try-on status request failed"
        }
        var $poll_body {
          value = $poll_response.response.result
        }
        var $poll_data {
          value = $poll_body|get:"data":{}
        }
        var $poll_results {
          value = $poll_data|get:"results":{}
        }
        var.update $task_status {
          value = $poll_data|get:"task_status":"pending"
        }
        var.update $result_url {
          value = $poll_results|get:"url":""
        }
        conditional {
          if ($task_status == "success" || $task_status == "error") {
            break
          }
        }
      }
    }

    precondition ($task_status == "success" && ($result_url|istarts_with:"https://")) {
      error_type = "inputerror"
      error = "Perfect Corp try-on did not complete successfully"
    }
  }
  response = {
    taskId: $task_id
    taskStatus: $task_status
    templateId: $template_id
    templateTitle: $template|get:"title":"Selected look"
    sourceImageUrl: $source_image_url
    resultUrl: $result_url
  }
  guid = "BKpqY1DgTZi7GMCbiLgHs0cP0n8"
}
