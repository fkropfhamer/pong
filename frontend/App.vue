<template>
  <div v-if="connection && !isDisconnected">
    <div v-if="hasUsername">
      <Chat :connection="{connection}"/>
    </div>
    <div v-else>
      <Username @username-set="onUsernameSet"/>
    </div>
  </div>
  <div v-else-if="isDisconnected">
    Disconnected
  </div>
  <div v-else>
    Connecting...
  </div>
</template>

<script>
import * as signalR from "@microsoft/signalr";
import Username from "./Username.vue";
import Chat from "./Chat.vue";

export default {
  components: {
    Username,
    Chat
  },
  data() {
    return {
      username: "",
      connection: null,
      hasUsername: false,
      isDisconnected: true,
    };
  },

  async mounted() {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7007/game")
      .build();

    connection.on("send", (data) => {
      console.log(data);
    });

    connection.onclose(() => {
      this.isDisconnected = true;
    })

    await connection.start();
    this.isDisconnected = false
    this.connection = connection;
    

    connection.invoke("Echo", "Hello");
  },

  methods: {
    onUsernameSet: function (username) {
      this.username = username
      this.connection.invoke("Join", this.username);
      this.hasUsername = true
    }
  },
};
</script>
