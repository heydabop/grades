package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	_ "github.com/mattn/go-sqlite3"
	"log"
	"net/http"
	"os"
	"strconv"
)

var (
	db *sql.DB
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
		http.Error(w, strconv.FormatInt(http.StatusBadRequest, 10)+" Error: "+err.Error(), http.StatusBadRequest)
		return
	}
	log.Println(req)
	stmt := "SELECT * FROM classes WHERE gpa NOT NULL "
	if len(req.Dept) > 0 {
		stmt += "AND dept='" + req.Dept + "' "
	}
	if len(req.Number) > 0 {
		stmt += "AND number=" + req.Number + " "
	}
	if len(req.Section) > 0 {
		stmt += "AND section=" + req.Section + " "
	}
	if len(req.Prof) > 0 {
		stmt += "AND prof='" + req.Prof + "' "
	}
	if len(req.Year) > 0 {
		stmt += "AND year=" + req.Year + " "
	}
	if len(req.Semester) > 0 {
		stmt += "AND semester='" + req.Semester + "' "
	}
	fmt.Println(stmt)
	rows, err := db.Query(stmt)
	if err != nil {
		log.Println(err)
		http.Error(w, strconv.FormatInt(http.StatusInternalServerError, 10)+" Error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	jsonString := "{\"classes\":["
	for rows.Next() {
		cols, err := rows.Columns()
		if err != nil {
			log.Println(err)
			http.Error(w, strconv.FormatInt(http.StatusInternalServerError, 10)+" Error", http.StatusInternalServerError)
			return
		}
		readResults := make([]interface{}, len(cols))
		writeResults := make([]string, len(cols))
		for i := range readResults {
			readResults[i] = &writeResults[i]
		}
		if err := rows.Scan(readResults...); err != nil {
			log.Println(err)
			http.Error(w, strconv.FormatInt(http.StatusInternalServerError, 10)+" Error", http.StatusInternalServerError)
			return
		}
		jsonString += "{"
		for i := range writeResults {
			jsonString += "\"" + cols[i] + "\":\"" + writeResults[i] + "\","
		}
		jsonString = jsonString[:len(jsonString)-1] + "},"
	}
	if err := rows.Err(); err != nil {
		log.Println(err)
		http.Error(w, strconv.FormatInt(http.StatusInternalServerError, 10)+" Error", http.StatusInternalServerError)
		return
	}
	jsonString = jsonString[:len(jsonString)-1] + "]}"
	fmt.Fprintln(w, jsonString)
}

func main() {
	if len(os.Args) != 2 {
		fmt.Printf("Usage: %s <sqlite3 db file>\n", os.Args[0])
		return
	}
	err := errors.New("")
	db, err = sql.Open("sqlite3", os.Args[1])
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	http.HandleFunc("/getData/", getDataHandler)
	err = http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal(err)
	}
}
