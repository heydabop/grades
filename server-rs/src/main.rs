#[macro_use]
extern crate rocket;
extern crate rocket_contrib;

use rocket::http::Status;
use rocket::request::{FromForm, LenientForm};
use rocket_contrib::compression::Compression;
use rocket_contrib::databases::database;
use rocket_contrib::databases::rusqlite::{self, NO_PARAMS};
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
async fn health(db: ClassesDb) -> Status {
    match db
        .run(|c| {
            c.query_row("SELECT 1 FROM classes", NO_PARAMS, |row| {
                row.get::<usize, i32>(0)
            })
        })
        .await
    {
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
async fn get_data(db: ClassesDb, body: LenientForm<GradesReq>) -> Result<Json<GradesResp>, Status> {
    if body.dept.is_none() || body.number.is_none() {
        println!("Incomplete request");
        return Err(Status::BadRequest);
    }
    let mut wheres = Vec::with_capacity(6);
    let mut params = Vec::with_capacity(6);
    if let Some(dept) = &body.dept {
        wheres.push("AND dept = ?");
        params.push(dept.clone());
    }
    if let Some(number) = &body.number {
        wheres.push("AND number = ?");
        params.push(number.clone());
    }
    if let Some(section) = &body.section {
        wheres.push("AND section = ?");
        params.push(section.clone());
    }
    if let Some(prof) = &body.prof {
        wheres.push("AND prof = ?");
        params.push(prof.clone());
    }
    if let Some(year) = &body.year {
        wheres.push("AND year = ?");
        params.push(year.clone());
    }
    if let Some(semester) = &body.semester {
        wheres.push("AND semester = ?");
        params.push(semester.clone());
    }
    let classes = db.run(move |c| {
        let mut statement = c.prepare(&format!(r#"SELECT dept, number, section, a, b, c, d, f, i, s, u, q, x, prof, year, semester, gpa FROM classes WHERE 1 {} ORDER BY year ASC, CASE WHEN semester = 'SPRING' THEN 1 WHEN semester = 'SUMMER' THEN 2 ELSE 3 END ASC"#, &wheres.concat())).unwrap();
        let rows = statement.query_map(&params[..], |row| {
            Ok(Class {
                dept: row.get_unwrap(0),
                number: row.get_unwrap::<usize, i64>(1).to_string(),
                section: row.get_unwrap::<usize, i64>(2).to_string(),
                a: row.get_unwrap::<usize, i64>(3).to_string(),
                b: row.get_unwrap::<usize, i64>(4).to_string(),
                c: row.get_unwrap::<usize, i64>(5).to_string(),
                d: row.get_unwrap::<usize, i64>(6).to_string(),
                f: row.get_unwrap::<usize, i64>(7).to_string(),
                i: row.get_unwrap::<usize, i64>(8).to_string(),
                s: row.get_unwrap::<usize, i64>(9).to_string(),
                u: row.get_unwrap::<usize, i64>(10).to_string(),
                q: row.get_unwrap::<usize, i64>(11).to_string(),
                x: row.get_unwrap::<usize, i64>(12).to_string(),
                prof: row.get_unwrap(13),
                year: row.get_unwrap::<usize, i64>(14).to_string(),
                semester: row.get_unwrap(15),
                gpa: row.get_unwrap::<usize, f64>(16).to_string(),
            })
        }).unwrap();

        let mut classes = vec![];
        for row in rows {
            classes.push(row.unwrap());
        }

        classes
    }).await;

    Ok(Json(GradesResp { classes }))
}

#[launch]
fn rocket() -> rocket::Rocket {
    rocket::ignite()
        .attach(ClassesDb::fairing())
        .mount("/", routes![health, get_data])
        .attach(Compression::fairing())
}
