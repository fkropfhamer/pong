using System.Collections.Concurrent;
using backend.Models;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs;

public class GameHub : Hub
{
    private static readonly ConcurrentDictionary<Guid, Game> Games = new ();
    private static readonly ConcurrentDictionary<string, Player> Players = new ();
    public void SendMessage(string message)
    {
        if (!Players.TryGetValue(Context.ConnectionId, out var player))
        {
            return;
        }

        var username = player.username;
        
        Clients.All.SendAsync("ReceiveMessage", username, message);
    }

    public Task Echo(string message)
    {
        return Clients.Client(Context.ConnectionId)
            .SendAsync("send", message);
    }

    public void JoinGame()
    {
        var client = Clients.Client(Context.ConnectionId);
        var user = new Player(client, "");
        
        var game = new Game();
        var id = Guid.NewGuid();

        Games.TryAdd(id, game);
        game.AddPlayer(user);
        
        game.Start();
    }

    public void Join(string username)
    {
        var connectionId = Context.ConnectionId;
        var client = Clients.Client(connectionId);
        var player = new Player(client, username);

        Players.TryAdd(connectionId, player);
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        var connectionId = Context.ConnectionId;
        Players.TryRemove(connectionId, out _);

        
        return base.OnDisconnectedAsync(exception);
    }
}