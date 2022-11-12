use futures_util::{SinkExt, StreamExt, TryFutureExt};
use serde::{Deserialize, Serialize};
use std::sync::{
    atomic::{AtomicUsize, Ordering},
    Arc, Mutex,
};
use std::{collections::HashMap, time::Duration, usize};
use tokio::{
    sync::{
        mpsc::{self, UnboundedSender},
        RwLock,
    },
};
use tokio_stream::wrappers::UnboundedReceiverStream;
use warp::ws::{Message, WebSocket};

static NEXT_USER_ID: AtomicUsize = AtomicUsize::new(1);
static NEXT_GAME_ID: AtomicUsize = AtomicUsize::new(1);

#[derive(Debug, Clone)]
pub struct User {
    id: usize,
    sender: UnboundedSender<Message>,
}

#[derive(Serialize, Deserialize)]
struct SocketEvent {
    event: String,
    payload: String,
}

#[derive(Debug, Copy, Clone)]
pub struct Game {
    id: usize,
    player1: usize,
    player2: usize,
    is_started: bool,
}

pub type Players = Arc<RwLock<HashMap<usize, User>>>;
pub type Games = Arc<RwLock<HashMap<usize, Game>>>;
pub type WaitingUserId = Arc<Mutex<Option<usize>>>;

pub fn game_handle(
    ws: warp::ws::Ws,
    users: Players,
    games: Games,
    waiting_user: WaitingUserId,
) -> impl warp::Reply {
    ws.on_upgrade(move |socket| user_connected(socket, users, games, waiting_user))
}

async fn user_connected(ws: WebSocket, users: Players, games: Games, waiting_user: WaitingUserId) {
    let my_id = NEXT_USER_ID.fetch_add(1, Ordering::Relaxed);

    let (mut user_ws_tx, mut user_ws_rx) = ws.split();

    let (tx, rx) = mpsc::unbounded_channel();
    let mut rx = UnboundedReceiverStream::new(rx);

    tokio::task::spawn(async move {
        while let Some(message) = rx.next().await {
            user_ws_tx.send(message).unwrap_or_else(|_e| {}).await;
        }
    });

    let mut user = User {
        id: my_id,
        sender: tx,
        // username: format!("<User#{}>", my_id),
    };

    users.write().await.insert(my_id, user);

    while let Some(result) = user_ws_rx.next().await {
        let msg = match result {
            Ok(msg) => msg,
            Err(_e) => {
                break;
            }
        };

        on_message(&my_id, msg, &users, &games, &waiting_user).await;
    }

    on_disconnect(my_id, &users).await;
}

async fn on_message(
    user_id: &usize,
    msg: Message,
    users: &Players,
    games: &Games,
    waiting_user: &WaitingUserId,
) {
    let msg = if let Ok(s) = msg.to_str() {
        s
    } else {
        return;
    };

    let event: SocketEvent = if let Ok(j) = serde_json::from_str(msg) {
        j
    } else {
        return;
    };

    eprintln!("event {}", event.event);

    match event.event.as_str() {
        "set_username" => {
            // user.username = event.payload;
        }
        "join" => {
            join(user_id, users, games, waiting_user).await;
        }
        _ => {
            eprintln!("unknown event: {}", event.event.as_str());
        }
    };
}

async fn join(user_id: &usize, users: &Players, games: &Games, waiting_user: &WaitingUserId) {
    eprintln!("join!");

    let game = get_game(user_id, waiting_user);

    match game {
        Some(g) => {
            println!("game found!");
            games.write().await.insert(g.id, g);
        }
        None => println!("no game found!"),
    }
}

fn get_game(user_id: &usize, waiting_user: &WaitingUserId) -> Option<Game> {
    let mut lock = waiting_user.try_lock();
    if let Ok(ref mut mutex) = lock {
        println!("try_lock succ");
        match &mut **mutex {
            Some(wuser_id) => {
                println!("waiting user found!");

                let game_id = NEXT_GAME_ID.fetch_add(1, Ordering::Relaxed);

                let user1 = user_id;
                let user2 = wuser_id;

                let game = Some(Game {
                    id: game_id,
                    player1: *user1,
                    player2: *user2,
                    is_started: false,
                });

                **mutex = None;

                return game;
            }
            None => {
                println!("no waiting user found!");

                **mutex = Some(*user_id);

                return None;
            }
        }
    } else {
        println!("try_lock failed");

        return None;
    }
}

async fn update_game(players: &Players, game: &Game) {
    let user_lock = players.read().await;
    let s1 = user_lock.get_key_value(&game.player1);
    let s2 = user_lock.get_key_value(&game.player2);

    println!("loop!");
    match s1 {
        Some((_, user)) => {
            if let Err(_disconnected) = user.sender.send(Message::text("haha")) {};
        }
        None => println!("socket no avail!"),
    }
    match s2 {
        Some((_, user)) => {
            if let Err(_disconnected) = user.sender.send(Message::text("haha")) {};
        }
        None => println!("socker no avail!"),
    }
}

pub async fn main_worker(players: &Players, games: &Games) {
    loop {
        tokio::time::sleep(Duration::from_millis(20)).await;

        let connected_client_count = players.read().await.len();
        if connected_client_count == 0 {
            println!("No clients connected, skip sending data");
            continue;
        }

        let games_count = games.read().await.len();
        if games_count == 0 {
            continue;
        }

        for (_, &game) in games.read().await.iter() {
            update_game(&players, &game).await;
        }

        println!("{} connected client(s)", connected_client_count);
    }
}

async fn on_disconnect(my_id: usize, users: &Players) {
    eprintln!("good bye user: {}", my_id);

    // Stream closed up, so remove from the user list
    users.write().await.remove(&my_id);
}
