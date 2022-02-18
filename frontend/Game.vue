<template>
  <canvas width="500" height="500" ref=canvas></canvas>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { initialize } from "./game";
 
const canvas = ref(null);

const props = defineProps({
  connection: Object,
});

const { connection } = props.connection;

onMounted(() => {
  initialize(canvas.value, connection)
});

</script>
