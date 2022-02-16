namespace backend.Models;

public class Game
{
    private Timer _loopTimer;
    private List<Player> _players = new List<Player>();

    public void Start()
    {
        _loopTimer = new Timer(
            GameLoop, null, 2000, 2000
        );
    }

    private void GameLoop(object state)
    {
        foreach (var player in _players)
        {
            player.Send("hello!");
        }
    }

    public void AddPlayer(Player player)
    {
        _players.Add(player);
    }
}