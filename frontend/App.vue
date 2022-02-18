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
      <h2>Enter Username</h2>
      <input v-model="username" />
      <button @click="submitUsername">submit</button>
    </div>
  </div>
  <div v-else>Connecting...</div>
</template>

<script>
import * as signalR from "@microsoft/signalr";
import { ref } from "vue";

export default {
  setup() {
    const username = ref("");
    const connection = ref(null);
    const hasUsername = ref(false);
    const messages = ref([]);
    const message = ref("");

    return {
      username,
      connection,
      hasUsername,
      messages,
      message,
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
    submitUsername: function () {
      if (this.username) {
        this.connection.invoke("Join", this.username);
        this.hasUsername = true;
        this.username = "";
      }
    },
    submitMessage: function () {
      if (this.message) {
        this.connection.invoke("SendMessage", this.message);

        this.message = "";
      }
    },
  },
};
</script>
