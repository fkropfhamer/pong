use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use warp::ws::{Message, WebSocket};
use tokio::sync::{mpsc, RwLock};
use futures_util::{SinkExt, StreamExt, TryFutureExt};
use tokio_stream::wrappers::UnboundedReceiverStream;
use std::sync::{
    atomic::{AtomicUsize, Ordering},
    Arc,
};

static NEXT_USER_ID: AtomicUsize = AtomicUsize::new(1);

struct User {
  id: usize,
  username: String,
}

#[derive(Serialize, Deserialize)]
struct SocketEvent {
  event: String,
  payload: String
}

pub type Users = Arc<RwLock<HashMap<usize, mpsc::UnboundedSender<Message>>>>;

#[derive(Serialize, Deserialize)]
struct ChatMessage {
    username: String,
    text: String,
}

pub fn chat_handle(ws: warp::ws::Ws, users: Users) -> impl warp::Reply {
  ws.on_upgrade(move |socket| user_connected(socket, users))
}

async fn user_connected(ws: WebSocket, users: Users) {
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

      user_message(&mut user, msg, &users).await;
  }

  user_disconnected(my_id, &users).await;
}

async fn user_message(user: &mut User, msg: Message, users: &Users) {
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

  eprintln!("chat event {}", event.event);

  match event.event.as_str() {
    "message" => {
      send_message(user, event.payload, users).await;
    },
    "set_username" => {
      user.username = event.payload;
    },
    _ => {}
  };
}

async fn send_message(user: &User, message: String, users: &Users) {
  let chat_message = ChatMessage {
    username: user.username.clone(),
    text: message
  };

  let new_msg = if let Ok(s) = serde_json::to_string(&chat_message) {
    s
  } else {
      return;
  };

  for (&uid, rx) in users.read().await.iter() {
      if user.id != uid {
        if let Err(_disconnected) = rx.send(Message::text(new_msg.clone())) {}
      }
  }
}

async fn user_disconnected(my_id: usize, users: &Users) {
  eprintln!("good bye user: {}", my_id);

  // Stream closed up, so remove from the user list
  users.write().await.remove(&my_id);
}
