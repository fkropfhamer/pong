<template>
  <h2>Enter Username</h2>
  <input v-model="username" />
  <button @click="submitUsername">submit</button>
</template>

<script setup>
import { ref, defineEmits } from "vue";

const emit = defineEmits(["usernameSet"]);
const username = ref("");

function submitUsername() {
  if (username.value) {
    emit("usernameSet", username.value);
    username.value = "";
  }
}
</script>