<script lang="ts">
    import { onMount } from 'svelte';

    let status = 'init'
    let socket: WebSocket | null = null


    onMount(() => {
        socket = new WebSocket('ws://localhost:3030/game')

        socket.addEventListener('open', () => {
            status = 'open'

            setTimeout(() => {
                if (!socket) {
                    return;
                }

                console.log('join');
                socket.send(JSON.stringify({ event: 'join', payload: '' }))
            }, 20);
        })

        socket.addEventListener('close', () => {
            status = 'close'
        })

        socket.addEventListener('message', (event) => {
            console.log(event.data)
            const rj = JSON.parse(event.data);
            console.log(rj)
        })
    })
</script>


<svelte:head>
	<title>Game</title>
</svelte:head>

<h1>Game</h1>
<p>Status {status}</p>
