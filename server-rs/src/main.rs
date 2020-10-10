#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use]
extern crate rocket;
#[macro_use]
extern crate rocket_contrib;

use rocket::http::Status;
use rocket::request::{FromForm, LenientForm};
use rocket_contrib::databases::rusqlite::{self, types::ToSql};
use rocket_contrib::json::Json;
use serde::Serialize;

#[database("classes")]
struct ClassesDb(rusqlite::Connection);

#[derive(FromForm)]
struct GradesReq {
    dept: Option<String>,
    number: Option<String>,
    section: Option<String>,
    prof: Option<String>,
    year: Option<String>,
    semester: Option<String>,
}

#[derive(Serialize)]
struct Class {
    dept: String,
    number: String,
    section: String,
    #[serde(rename = "A")]
    a: String,
    #[serde(rename = "B")]
    b: String,
    #[serde(rename = "C")]
    c: String,
    #[serde(rename = "D")]
    d: String,
    #[serde(rename = "F")]
    f: String,
    #[serde(rename = "I")]
    i: String,
    #[serde(rename = "S")]
    s: String,
    #[serde(rename = "U")]
    u: String,
    #[serde(rename = "Q")]
    q: String,
    #[serde(rename = "X")]
    x: String,
    prof: String,
    year: String,
    semester: String,
    gpa: String,
}

#[derive(Serialize)]
struct GradesResp {
    classes: Vec<Class>,
}

#[get("/health")]
fn health(db: ClassesDb) -> Status {
    match db.query_row("SELECT 1 FROM classes", &[], |row| row.get::<usize, i32>(0)) {
        Ok(one) => {
            if one == 1 {
                Status::Ok
            } else {
                println!("Health check not equal to 1");
                Status::InternalServerError
            }
        }
        Err(e) => {
            println!("Error in SQL health check: {}", e);
            Status::InternalServerError
        }
    }
}

#[post("/getData", data = "<body>")]
fn get_data(db: ClassesDb, body: LenientForm<GradesReq>) -> Result<Json<GradesResp>, Status> {
    if body.dept.is_none() || body.number.is_none() {
        println!("Incomplete request");
        return Err(Status::BadRequest);
    }
    let mut wheres = Vec::with_capacity(6);
    let mut params: Vec<&dyn ToSql> = Vec::with_capacity(6);
    if let Some(dept) = &body.dept {
        wheres.push("AND dept = ?");
        params.push(dept);
    }
    if let Some(number) = &body.number {
        wheres.push("AND number = ?");
        params.push(number);
    }
    if let Some(section) = &body.section {
        wheres.push("AND section = ?");
        params.push(section);
    }
    if let Some(prof) = &body.prof {
        wheres.push("AND prof = ?");
        params.push(prof);
    }
    if let Some(year) = &body.year {
        wheres.push("AND year = ?");
        params.push(year);
    }
    if let Some(semester) = &body.semester {
        wheres.push("AND semester = ?");
        params.push(semester);
    }
    let mut statement = db.prepare(&format!(r#"SELECT dept, number, section, a, b, c, d, f, i, s, u, q, x, prof, year, semester, gpa FROM classes WHERE 1 {} ORDER BY year ASC, CASE WHEN semester = 'SPRING' THEN 1 WHEN semester = 'SUMMER' THEN 2 ELSE 3 END ASC"#, &wheres.concat())).unwrap();
    let mut rows = statement.query(&params[..]).unwrap();

    let mut classes = vec![];
    while let Some(row) = rows.next() {
        let row = row.unwrap();
        classes.push(Class {
            dept: row.get(0),
            number: row.get::<usize, i64>(1).to_string(),
            section: row.get::<usize, i64>(2).to_string(),
            a: row.get::<usize, i64>(3).to_string(),
            b: row.get::<usize, i64>(4).to_string(),
            c: row.get::<usize, i64>(5).to_string(),
            d: row.get::<usize, i64>(6).to_string(),
            f: row.get::<usize, i64>(7).to_string(),
            i: row.get::<usize, i64>(8).to_string(),
            s: row.get::<usize, i64>(9).to_string(),
            u: row.get::<usize, i64>(10).to_string(),
            q: row.get::<usize, i64>(11).to_string(),
            x: row.get::<usize, i64>(12).to_string(),
            prof: row.get(13),
            year: row.get::<usize, i64>(14).to_string(),
            semester: row.get(15),
            gpa: row.get::<usize, f64>(16).to_string(),
        });
    }

    return Ok(Json(GradesResp { classes: classes }));
}

fn main() {
    rocket::ignite()
        .attach(ClassesDb::fairing())
        .mount("/", routes![health, get_data])
        .launch();
}
