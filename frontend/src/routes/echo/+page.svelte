<script lang="ts">
    import { onMount } from 'svelte';

    let socket: WebSocket | null = null

    function handleClick() {
        if (!socket) {
            return
        }
        socket.send("yep!")
    }

    onMount(() => {
        socket = new WebSocket('ws://localhost:3030/echo')

        socket.addEventListener('open', (_) => {
            console.log("open");
        })

        socket.addEventListener('message', (event) => {
            console.log(event.data)
        })
    })
</script>

<h1>echo</h1>
<button on:click={handleClick}>Click me!</button>