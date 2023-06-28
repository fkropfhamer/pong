package pong

type Game struct {
	FieldState    FieldState
	stopChan      chan bool
	ballDirection [2]float32
}

type FieldState struct {
	BallPos  [2]float32
	Score1   int
	Score2   int
	Paddle1Y float32
	Paddle2Y float32
}

func NewGame() *Game {
	state := FieldState{
		BallPos:  [2]float32{0, 0},
		Paddle1Y: 0,
		Paddle2Y: 0,
		Score1:   0,
		Score2:   0,
	}

	g := Game{
		FieldState:    state,
		ballDirection: [2]float32{0, 0},
	}

	return &g
}

func (g *Game) Update(timeDelta int64) {
	g.FieldState.BallPos[0] = g.FieldState.BallPos[0] + 1
	//fmt.Println(g.FieldState, timeDelta)
}

func (g *Game) UpdatePaddle1Y(delta float32) {
	g.FieldState.Paddle1Y += delta
}

func (g *Game) UpdatePaddle2Y(delta float32) {
	g.FieldState.Paddle2Y += delta
}
