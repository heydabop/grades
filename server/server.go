package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type gradeReq struct {
	Dept     string
	Number   string
	Section  string
	Prof     string
	Year     string
	Semester string
}

func getDataHandler(w http.ResponseWriter, r *http.Request) {
	req := gradeReq{}
	err := json.Unmarshal([]byte(r.PostFormValue("reqJSON")), &req)
	if err != nil {
		log.Println(err)
		return
	}
	log.Println(req)
	fmt.Fprintf(w, "Dept: %s\nNumber: %s\nSection: %s\nProf: %s\nYear: %s\nSemester: %s\n",
		req.Dept, req.Number, req.Section, req.Prof, req.Year, req.Semester)
}

func main() {
	http.HandleFunc("/getData/", getDataHandler)
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal(err)
	}
}
