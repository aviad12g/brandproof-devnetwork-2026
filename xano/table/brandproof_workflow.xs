table "brandproof_workflow" {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    timestamp updated_at?=now
    text dossier_key filters=trim
    enum status?="review" {
      values = ["review", "market", "experience", "ready"]
    }
    int? approved_spf
    json extraction_json?
    json market_json?
    json tryon_json?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "status"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
  guid = "nQtx1HN-8iFHp_65042ib72aRVU"
}
