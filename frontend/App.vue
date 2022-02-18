<template>
  <div v-if="connection">
    <div v-if="hasUsername">
      <h2>chat</h2>
      <input v-model="message" />
      <button @click="submitMessage">send</button>
      <ul>
        <li v-for="(message, index) in messages" :key="index">
          {{ `${message.username}: ${message.message}` }}
        </li>
      </ul>
    </div>
    <div v-else>
      <Username @username-set="onUsernameSet"/>
    </div>
  </div>
  <div v-else>Connecting...</div>
</template>

<script>
import * as signalR from "@microsoft/signalr";
import Username from "./Username.vue";

export default {
  components: {
    Username
  },
  data() {
    return {
      username: "",
      connection: null,
      hasUsername: false,
      messages: [],
      message: "",
    };
  },

  async mounted() {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7007/game")
      .build();

    connection.on("send", (data) => {
      console.log(data);
    });

    connection.on("ReceiveMessage", (username, message) => {
      console.log(message);
      this.messages.push({ username, message });
    });

    await connection.start();

    this.connection = connection;

    connection.invoke("Echo", "Hello");
  },

  methods: {
    submitMessage: function () {
      if (this.message) {
        this.connection.invoke("SendMessage", this.message);

        this.message = "";
      }
    },
    onUsernameSet: function (username) {
      this.username = username
      this.connection.invoke("Join", this.username);
      this.hasUsername = true
    }
  },
};
</script>
