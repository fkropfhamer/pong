<template>
  <h2>chat</h2>
  <input v-model="message" />
  <button @click="submitMessage">send</button>
  <ul>
    <li v-for="(message, index) in messages" :key="index">
      {{ `${message.username}: ${message.message}` }}
    </li>
  </ul>
</template>

<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
  connection: Object,
});

const { connection } = props.connection;

const message = ref("");
const messages = ref([]);

function submitMessage() {
  if (message.value) {
    connection.invoke("SendMessage", message.value);

    message.value = "";
  }
}

onMounted(() => {
  connection.on("ReceiveMessage", (username, message) => {
    console.log(message);
    messages.value.push({ username, message });
  });
});
</script>