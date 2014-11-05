package main

import(
	_ "github.com/mattn/go-sqlite3"
	"database/sql"
	"bufio"
	"fmt"
	"log"
	"os"
	"regexp"
)

func main(){
	classLineRegex := regexp.MustCompile(`^([A-Z]{4})-(\d{3})-\d{3}\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+\d+\s+[0-9.]+\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+\d+\s+([A-Za-z ]+)`)
	if(len(os.Args) != 2){
		fmt.Printf("Usage: %s <txt file>\n", os.Args[0])
	}
	txtFile, err := os.Open(os.Args[1])
	if err != nil {
		log.Fatal(err)
	}
	defer txtFile.Close()
	db, err := sql.Open("sqlite3", "../classes.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	txtReader := bufio.NewReader(txtFile)
	line := ""
	for line, err = txtReader.ReadString('\n'); err == nil; line, err = txtReader.ReadString('\n') {
		if match := classLineRegex.FindStringSubmatch(line); match != nil {
			/*for i := 1; i < len(match); i++ {
				fmt.Printf("%s, ", match[i])
			}
			fmt.Println()*/
			dept := match[1]
			classNo := match[2]
			A := match[3]
			B := match[4]
			C := match[5]
			D := match[6]
			F := match[7]
			I := match[8]
			S := match[9]
			U := match[10]
			Q := match[11]
			X := match[12]
			prof := match[13]
			sqlStmt := `INSERT INTO classes VALUES('`+dept+`', `+classNo+`,`+A+`, `+B+`, `+C+`, `+D+`, `+F+`, `+I+`, `+S+`, `+U+`, `+Q+`, `+X+`, '`+prof+`');`
			fmt.Println(sqlStmt)
			_, err = db.Exec(sqlStmt)
			if err != nil {
				log.Fatal(err)
			}
		}
	}
	if err != nil {
		log.Println(err)
	}
}
