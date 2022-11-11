<script lang="ts">
    import { onMount } from 'svelte';

    interface ChatMessage {
        username: string,
        text: string,
    }

    let socket: WebSocket | null = null
    let messages: ChatMessage[] = []
    let message = ""
    let username = ""

    function handleClick() {
        if (!socket) {
            return
        }
        socket.send(JSON.stringify({ event: "message", payload: message}))
        const myMessage = { username: "you", text: message }
        messages = [...messages, myMessage]
        message = ""
    }

    function handleUsernameClick() {
        if (!socket) {
            return
        }
        socket.send(JSON.stringify({ event: "set_username", payload: username}))
        username = ""
    }

    onMount(() => {
        socket = new WebSocket('ws://localhost:3030/chat')

        socket.addEventListener('open', (_) => {
            console.log("open");
        })

        socket.addEventListener('message', (event) => {
            console.log(event.data)
            const recievedMessage = JSON.parse(event.data);
            console.log(message)

            messages = [...messages, recievedMessage]
        })
    })
</script>


<svelte:head>
	<title>Chat</title>
</svelte:head>

<h1>Chat</h1>
<input bind:value={message} >
<button on:click={handleClick}>send</button>
<input bind:value={username} >
<button on:click={handleUsernameClick}>send</button>
{#each messages as message}
    <p>{message.username}: {message.text}</p>
{/each}
