package main

import (
	"bufio"
	"database/sql"
	"fmt"
	_ "github.com/mattn/go-sqlite3"
	"log"
	"os"
	"regexp"
	"strconv"
)

func main() {
	classLineRegex := regexp.MustCompile(`^([A-Z]{4})-(\d{3})-(\d{3})\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+\d+\s+[0-9.]+\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+\d+\s+([A-Za-z ]+)`)
	yearSemesterRegex := regexp.MustCompile(`GRADE DISTRIBUTION REPORT FOR (\w+) (\d+)`)
	if len(os.Args) != 3 {
		fmt.Printf("Usage: %s <txt file> <sqlite3 db file>\n", os.Args[0])
		os.Exit(1)
	}
	txtFile, err := os.Open(os.Args[1])
	if err != nil {
		log.Fatal(err)
	}
	defer txtFile.Close()
	db, err := sql.Open("sqlite3", os.Args[2])
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	txtReader := bufio.NewReader(txtFile)
	line := ""
	year := ""
	semester := ""
	count := 0
	fmt.Println("BEGIN;")
	_, err = db.Exec("BEGIN;")
	if err != nil {
		log.Fatal(err)
	}
	for line, err = txtReader.ReadString('\n'); err == nil; line, err = txtReader.ReadString('\n') {
		if len(year) == 0 {
			match := yearSemesterRegex.FindStringSubmatch(line)
			if match != nil {
				semester = match[1]
				year = match[2]
			}
		}
		if match := classLineRegex.FindStringSubmatch(line); match != nil {
			/*for i := 1; i < len(match); i++ {
				fmt.Printf("%s, ", match[i])
			}
			fmt.Println()*/
			dept := match[1]
			number := match[2]
			section := match[3]
			A, _ := strconv.ParseUint(match[4], 10, 32)
			B, _ := strconv.ParseUint(match[5], 10, 32)
			C, _ := strconv.ParseUint(match[6], 10, 32)
			D, _ := strconv.ParseUint(match[7], 10, 32)
			F, _ := strconv.ParseUint(match[8], 10, 32)
			I := match[9]
			S := match[10]
			U := match[11]
			Q := match[12]
			X := match[13]
			gpa := float64(A*4 + B*3 + C*2 + D*1)/float64(A+B+C+D+F)
			prof := match[14]
			sqlStmt := `INSERT INTO classes VALUES('` + dept + `', ` + number + `, ` + section + `, ` + strconv.FormatUint(A, 10) + `, ` + strconv.FormatUint(B, 10) + `, ` + strconv.FormatUint(C, 10) + `, ` + strconv.FormatUint(D, 10) + `, ` + strconv.FormatUint(F, 10) + `, ` + I + `, ` + S + `, ` + U + `, ` + Q + `, ` + X + `, '` + prof + `', ` + year + `, '` + semester + `', ` + strconv.FormatFloat(gpa, 'f', 14, 64) + `);`
			fmt.Println(sqlStmt)
			_, err = db.Exec(sqlStmt)
			if err != nil {
				fmt.Println("ROLLBACK;")
				db.Exec("ROLLBACK;")
				log.Fatal(err)
			}
			count++
		}
	}
	if err != nil {
		fmt.Println("ROLLBACK;")
		db.Exec("ROLLBACK;")
		log.Fatal(err)
	}
	fmt.Println("COMMIT;")
	db.Exec("COMMIT;")
	fmt.Printf("%d rows inserted\n", count)
}
