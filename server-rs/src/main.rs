#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use]
extern crate rocket;
#[macro_use]
extern crate rocket_contrib;

use rocket_contrib::databases::rusqlite;

#[database("grades")]
struct GradesDb(rusqlite::Connection);

#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

fn main() {
    rocket::ignite()
        .attach(GradesDb::fairing())
        .mount("/", routes![index])
        .launch();
}
