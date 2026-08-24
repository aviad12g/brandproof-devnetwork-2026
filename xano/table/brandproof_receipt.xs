table "brandproof_receipt" {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int workflow_id {
      table = "brandproof_workflow"
    }
    enum provider {
      values = ["xano", "nutrient", "serpapi", "perfect"]
    }
    text operation filters=trim
    enum mode {
      values = ["live", "fixture", "unavailable"]
    }
    enum status {
      values = ["success", "blocked", "pending"]
    }
    text resource_id filters=trim
    int? duration_ms
    json metadata?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "workflow_id"}, {name: "created_at", op: "desc"}]}
  ]
  guid = "pb8z50XzH_zdZ1lCt3KCOe2rnN8"
}
