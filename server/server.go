package main

import (
	"database/sql"
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
	dept := r.PostFormValue("dept")
	number := r.PostFormValue("number")
	section := r.PostFormValue("section")
	prof := r.PostFormValue("prof")
	year := r.PostFormValue("year")
	semester := r.PostFormValue("semester")
	log.Println(r.Form)
	stmt := "SELECT * FROM classes WHERE 1 "
	if len(dept) > 0 {
		stmt += "AND dept='" + dept + "' "
	}
	if len(number) > 0 {
		stmt += "AND number=" + number + " "
	}
	if len(section) > 0 {
		stmt += "AND section=" + section + " "
	}
	if len(prof) > 0 {
		stmt += "AND prof='" + prof + "' "
	}
	if len(year) > 0 {
		stmt += "AND year=" + year + " "
	}
	if len(semester) > 0 {
		stmt += "AND semester='" + semester + "' "
	}
	stmt += "ORDER BY year ASC, CASE WHEN semester = 'SPRING' THEN 1 WHEN semester = 'SUMMER' THEN 2 ELSE 3 END ASC"
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
		writeResults := make([]sql.NullString, len(cols))
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
			if writeResults[i].Valid {
				jsonString += "\"" + cols[i] + "\":\"" + writeResults[i].String + "\","
			}
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
