using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs;

public class GameHub : Hub
{
    public Task SendMessage(string user, string message)
    {
        return Clients.All.SendAsync("ReceiveMessage", user, message);
    }

    public Task Echo(string message)
    {
        return Clients.Client(Context.ConnectionId)
            .SendAsync("send", message);
    }
}