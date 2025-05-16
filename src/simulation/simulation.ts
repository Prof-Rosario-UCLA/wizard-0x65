export enum CardState {
	Alive,
	Dead,
}

export enum CardTeam {
	Player,
	Enemy,
}

export class CardBase {
	/* These are part of the card's identity */
	/**
	 * The database ID of the card.
	 */
	public deckCardId: string;

	/**
	 * The current health of the card.
	 */
	public health: number;

	/**
	 * The base damage of the card.
	 */
	public damage: number;

	/* These are part of the runtime state */
	public state: CardState = CardState.Alive;
	public team: CardTeam = CardTeam.Player;
	public game?: Game;

	constructor(deckCardId: string, health: number, damage: number) {
		this.deckCardId = deckCardId;
		this.health = health;
		this.damage = damage;
	}

	/**
	 * The ID of the card. This is used in API requests and the database.
	 */
	get id(): string {
		return "base";
	}

	/**
	 * The name of the card. This is used in the UI.
	 * This should be a human-readable name.
	 */
	get name(): string {
		return "Base Card";
	}

	/**
	 * Attacks the enemy card.
	 * @param enemyCard The card to attack.
	 */
	attack(enemyCard: CardBase): void {
		enemyCard.takeDamage(this.damage);
	}

	/**
	 * Takes damage from an attack.
	 * @param amount The amount of damage to deal.
	 */
	takeDamage(amount: number): void {
		const event = new HealthChangedEvent();
		event.card = this;
		event.delta = -amount;
		this.game.broadcast(event);

		if(event.cancelled) {
			return;
		}

		this.health += event.delta;
		if (this.health <= 0) {
			const event = new CardDiedEvent();
			event.card = this;
			this.game.broadcast(event);

			// if some card healed us, don't die
			if(this.health <= 0) {
				this.state = CardState.Dead;
			}
		}
	}

	onEvent(event: GameEvent): void {}

	clone(): CardBase {
		return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
	}
};

export enum GameEventType {
	RoundStart,

	/**
	 * Fired when the round ends.
	 * Note that this only occurs on the server, since
	 * the client doesn't simulate during the shop.
	 */
	RoundEnd,
	HealthChanged,
	CardDied,
};

export class GameEvent {
	cancelled: boolean = false;
	get type(): GameEventType {
		return null
	}
};

/**
 * Fired when the round is started. Note that
 * this is called on the first *step*, not on construction.
 */
export class RoundStartEvent extends GameEvent {
	get type(): GameEventType {
		return GameEventType.RoundStart;
	}
};

export class HealthChangedEvent extends GameEvent {
	public card: CardBase;
	public delta: number;

	get type(): GameEventType {
		return GameEventType.HealthChanged;
	}
};

export class CardDiedEvent extends GameEvent {
	public card: CardBase;

	get type(): GameEventType {
		return GameEventType.CardDied;
	}
};

export enum GameState {
	Running,
	Over,
};

export enum WinState {
	Player,
	Enemy,
	Stalemate,
}

export class Game {
	public playerDeck: CardBase[];
	public enemyDeck: CardBase[];

	public gameState: GameState = GameState.Running;
	public winState?: WinState = null;

	#started: boolean = false;

	constructor(playerDeck: CardBase[], enemyDeck: CardBase[]) {
		this.playerDeck = playerDeck;
		this.enemyDeck = enemyDeck;

		this.#forEachCard((card, team) => {
			card.game = this;
			card.team = team;
		});

		// update win state immediately
		// for the edge cases of the player/enemy
		// having no cards at the start of the game
		this.#updateWinState();
	}

	step(): GameState {
		// update win state and return early if game is already over
		// note: this is somewhat redundant, but it makes the code easier to read
		if (this.gameState === GameState.Over) {
			return this.gameState;
		}

		if (!this.#started) {
			this.#started = true;
			const event = new RoundStartEvent();
			this.broadcast(event);
		}

		const playerCard = this.playerDeck[0];
		const enemyCard = this.enemyDeck[0];

		// attack cards
		playerCard.attack(enemyCard);
		enemyCard.attack(playerCard);

		// remove all dead cards
		this.playerDeck = this.playerDeck.filter((card) => card.state !== CardState.Dead);
		this.enemyDeck = this.enemyDeck.filter((card) => card.state !== CardState.Dead);

		// update win state again
		this.#updateWinState();
		return this.gameState;
	}

	#updateWinState(): void {
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
	}

	#forEachCard(
		callback: (card: CardBase, cardTeam: CardTeam) => void
	): void {
		this.playerDeck.forEach(card => callback(card, CardTeam.Player));
		this.enemyDeck.forEach(card => callback(card, CardTeam.Enemy));
	}

	getDeck(team: CardTeam): CardBase[] {
		return team === CardTeam.Player
			? this.playerDeck
			: this.enemyDeck;
	}

	broadcast(event: GameEvent): void {
		this.#forEachCard((card) => card.onEvent(event));
	}

	spawn(card: CardBase, team: CardTeam, idx: number): void {
		this.getDeck(team).splice(idx, 0, card);
	}

	indexOfCard(card: CardBase): number {
		return this.getDeck(card.team).indexOf(card);
	}
};