package pong

const fieldHeight = 500
const fieldWidth = 800
const ballSize = 10
const xConstraint = fieldWidth - ballSize
const yConstraint = fieldHeight - ballSize
const paddleHeight = 100

type Game struct {
	FieldState    FieldState
	ballDirection [2]float32
	isRunning     bool
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
		ballDirection: [2]float32{0.2, 0.3},
	}

	return &g
}

func (g *Game) Update(timeDelta int64) {
	if !g.isRunning {
		g.isRunning = true
		timeDelta = 1
	}

	xDelta := g.ballDirection[0] * float32(timeDelta)
	yDelta := g.ballDirection[1] * float32(timeDelta)

	g.FieldState.BallPos[0] = g.FieldState.BallPos[0] + xDelta
	g.FieldState.BallPos[1] = g.FieldState.BallPos[1] + yDelta

	if g.FieldState.BallPos[0] > xConstraint || g.FieldState.BallPos[0] < -xConstraint {
		g.ballDirection[0] = -g.ballDirection[0]
	}

	if g.FieldState.BallPos[1] > yConstraint || g.FieldState.BallPos[1] < -yConstraint {
		g.ballDirection[1] = -g.ballDirection[1]
	}
}

func (g *Game) UpdatePaddle1Y(delta float32) {
	g.FieldState.Paddle1Y += delta
}

func (g *Game) UpdatePaddle2Y(delta float32) {
	g.FieldState.Paddle2Y += delta
}
