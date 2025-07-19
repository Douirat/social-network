package utils

import (
	"encoding/json"
	"net/http"
)

func ResponseJSON(w http.ResponseWriter, status int ,message any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(&message)
}
