export class CardBase {
	public id: string;
	public health: number;
	public damage: number;

	constructor(id: string) {
		this.id = id;
	}

	get name(): string {
		return null;
	}

	bindEffects(): void {}
};

enum GameState {
	Running,
	Over,
};

enum WinState {
	Player,
	Enemy,
	Stalemate,
}

export class Game {
	public playerDeck: CardBase[];
	public enemyDeck: CardBase[];

	public gameState: GameState = GameState.Running;
	public winState?: WinState = null;

	step(): GameState {
		// if already over, return
		if (this.gameState === GameState.Over) {
			return this.gameState;
		}

		if (this.playerDeck.length === 0 && this.enemyDeck.length === 0) {
			this.gameState = GameState.Over;
			this.winState = WinState.Stalemate;
		}
		else if(this.playerDeck.length === 0) {
			this.gameState = GameState.Over;
			this.winState = WinState.Enemy;
		}
		else if(this.enemyDeck.length === 0) {
			this.gameState = GameState.Over;
			this.winState = WinState.Player;
		}

		// if just ended, return
		if (this.gameState === GameState.Over) {
			return this.gameState;
		}

		const playerCard = this.playerDeck[0];
		const enemyCard = this.enemyDeck[0];

		return this.gameState;
	}
};