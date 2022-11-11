use warp::Filter;
use std::collections::HashMap;
use futures_util::{StreamExt, FutureExt};

mod chat;


#[tokio::main]
async fn main() {
    let users = chat::Users::default();
    let users = warp::any().map(move || users.clone());

    let chat = warp::path("chat").and(warp::ws()).and(users).map(chat::chat_handle);

    // GET /hello/warp => 200 OK with body "Hello, warp!"
    let hello = warp::path!("hello" / String)
        .map(|name| format!("Hello, {}!", name));

    let status = warp::path("status").map(|| warp::reply::json(&HashMap::from([("status", "ok")])));
    let index = warp::path::end().map(|| "index");

    let echo = warp::path("echo")
        .and(warp::ws())
        .map(echo_handle);
    
    let routes = index.or(status).or(hello).or(echo).or(chat);

    warp::serve(routes)
        .run(([127, 0, 0, 1], 3030))
        .await;
}


fn echo_handle(ws: warp::ws::Ws) -> impl warp::Reply {
    ws.on_upgrade(|websocket| {
        let (tx, rx) = websocket.split();
        rx.forward(tx).map(|_result| {
        })
    })
}
