#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use]
extern crate rocket;
#[macro_use]
extern crate rocket_contrib;

use rocket::http::Status;
use rocket_contrib::databases::rusqlite;

#[database("classes")]
struct ClassesDb(rusqlite::Connection);

#[get("/health")]
fn index(db: ClassesDb) -> Status {
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

fn main() {
    rocket::ignite()
        .attach(ClassesDb::fairing())
        .mount("/", routes![index])
        .launch();
}
