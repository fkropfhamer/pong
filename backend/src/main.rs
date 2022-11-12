use game::{Players, Games};
use warp::Filter;
use std::{collections::HashMap, convert::Infallible};
use futures_util::{StreamExt, FutureExt};

mod chat;
mod game;


#[tokio::main]
async fn main() {
    let users = chat::Users::default();
    let players = game::Players::default();
    let games = game::Games::default();
    let waiting_user = game::WaitingUserId::default();
    
    let users = warp::any().map(move || users.clone());
    let waiting_user = warp::any().map(move || waiting_user.clone());

    let chat = warp::path("chat").and(warp::ws()).and(users).map(chat::chat_handle);

    let game = warp::path("game").and(warp::ws()).and(with_players(players.clone())).and(with_games(games.clone())).and(waiting_user).map(game::game_handle);

    // GET /hello/warp => 200 OK with body "Hello, warp!"
    let hello = warp::path!("hello" / String)
        .map(|name| format!("Hello, {}!", name));

    let status = warp::path("status").map(|| warp::reply::json(&HashMap::from([("status", "ok")])));
    let index = warp::path::end().map(|| "index");

    let echo = warp::path("echo")
        .and(warp::ws())
        .map(echo_handle);
    
    let routes = index.or(status).or(hello).or(echo).or(game).or(chat);

    // let players = game::Players::default();
    // let games = game::Games::default();

    tokio::task::spawn(async move {
        game::main_worker(&players.clone(), &games.clone()).await;
    });

    warp::serve(routes)
        .run(([127, 0, 0, 1], 3030))
        .await;
}

fn with_players(clients: Players) -> impl Filter<Extract = (Players,), Error = Infallible> + Clone {
    warp::any().map(move || clients.clone())
}

fn with_games(clients: Games) -> impl Filter<Extract = (Games,), Error = Infallible> + Clone {
    warp::any().map(move || clients.clone())
}


fn echo_handle(ws: warp::ws::Ws) -> impl warp::Reply {
    ws.on_upgrade(|websocket| {
        let (tx, rx) = websocket.split();
        rx.forward(tx).map(|_result| {
        })
    })
}
