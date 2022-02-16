using Microsoft.AspNetCore.SignalR;

namespace backend.Models;

public class Player
{
    private readonly IClientProxy _client;
    public string username { get; }
    
    public Player(IClientProxy client, string username)
    {
        _client = client;
        this.username = username;
    }
    
    public void Send(string message)
    {
        _client.SendAsync("message", message);
    }
}