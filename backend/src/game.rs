use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use warp::ws::{Message, WebSocket};
use tokio::sync::{mpsc, RwLock};
use futures_util::{SinkExt, StreamExt, TryFutureExt};
use tokio_stream::wrappers::UnboundedReceiverStream;
use std::sync::{
    atomic::{AtomicUsize, Ordering},
    Arc,
    Mutex,
};

use crate::{chat::Users};

static NEXT_USER_ID: AtomicUsize = AtomicUsize::new(1);
static NEXT_GAME_ID: AtomicUsize = AtomicUsize::new(1);

struct User {
  id: usize,
  username: String,
}

#[derive(Serialize, Deserialize)]
struct SocketEvent {
  event: String,
  payload: String
}

#[derive(Debug, Copy, Clone)]
pub struct Game {
    id: usize,
    player1: usize,
    player2: usize,
}

pub type Games = Arc<RwLock<HashMap<usize, Game>>>;
pub type WaitingUserId = Arc<Mutex<Option<usize>>>;

pub fn game_handle(ws: warp::ws::Ws, users: Users, games: Games, waiting_game: WaitingUserId) -> impl warp::Reply {
    ws.on_upgrade(move |socket| user_connected(socket, users, games, waiting_game))
}

async fn user_connected(ws: WebSocket, users: Users, games: Games, waiting_game: WaitingUserId) {
    let my_id = NEXT_USER_ID.fetch_add(1, Ordering::Relaxed);
  
    let (mut user_ws_tx, mut user_ws_rx) = ws.split();
  
    let (tx, rx) = mpsc::unbounded_channel();
    let mut rx = UnboundedReceiverStream::new(rx);
  
    tokio::task::spawn(async move {
        while let Some(message) = rx.next().await {
            user_ws_tx
                .send(message)
                .unwrap_or_else(|_e| {})
                .await;
        }
    });
  
    let mut user = User {
      id: my_id,
      username: format!("<User#{}>", my_id),
    };
    
    users.write().await.insert(my_id, tx);
  
    while let Some(result) = user_ws_rx.next().await {
        let msg = match result {
            Ok(msg) => msg,
            Err(_e) => { break; }
        };
  
        on_message(&mut user, msg, &users, &games, &waiting_game).await;
    }
  
    on_disconnect(my_id, &users).await;
  }
  
  async fn on_message(user: &mut User, msg: Message, users: &Users, games: &Games, waiting_game: &WaitingUserId) {
    let msg = if let Ok(s) = msg.to_str() {
        s
    } else {
        return;
    };
  
    let event: SocketEvent = if let Ok(j) = serde_json::from_str(msg) {
      j 
    } else {
      return
    };
  
    eprintln!("event {}", event.event);
  
    match event.event.as_str() {
      "set_username" => {
        user.username = event.payload;
      },
      "join" => {
        join(user, users, games, waiting_game).await;
      },
      _ => {
        eprintln!("unknown event: {}", event.event.as_str());
      }
    };
  }

  async fn join(user: &User, users: &Users, games: &Games, waiting_game: &WaitingUserId) {
    eprintln!("join!");

    let game = get_game(user, users, games, waiting_game);

    match game {
      Some(g) => {
        println!("game found!");
        games.write().await.insert(g.id, g);
      },
      None => println!("no game found!")
    }
  }

  fn get_game(user: &User, users: &Users, games: &Games, waiting_game: &WaitingUserId) -> Option<Game> {
    let mut lock = waiting_game.try_lock();
    if let Ok(ref mut mutex) = lock {
        println!("try_lock succ");
        match &mut **mutex {
          Some(user_id) => {
             println!("waiting user found!");

             let game_id = NEXT_GAME_ID.fetch_add(1, Ordering::Relaxed);

             let user1 = user.id;
             let user2 = user_id;
            
              let game = Some(Game {
                id: game_id,
                player1: user1,
                player2: *user2,
              });

              **mutex = None;

              return game;
          },
          None => {
            println!("no waiting user found!");
            
            **mutex = Some(user.id);

            return None;
          }
        }
    } else {
        println!("try_lock failed");

        return None
    }
  } 

  async fn on_disconnect(my_id: usize, users: &Users) {
    eprintln!("good bye user: {}", my_id);
  
    // Stream closed up, so remove from the user list
    users.write().await.remove(&my_id);
  }