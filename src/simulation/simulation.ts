import { Action, AttackAction } from "./actions";

export enum CardState {
    Alive,
    Dead,
}

export enum CardTeam {
    Player,
    Enemy,
}

export type CardMetadata = {
    /**
     * ID of the card (to be stored in DB and keys of JSON)
     */
    id: string;
    /**
     * Name of the card (to be displayed in UI)
     */
    name: string;
    /**
     * Description of the card (to be displayed in UI)
     */
    description: string;

    /**
     * The base health of the card (in the shop)
     */
    baseHealth: number;
    /**
     * The base damage of the card (in the shop)
     */
    baseDamage: number;
    /**
     * Price of the card (in the shop)
     */
    price: number;
};

export class CardBase {
    /* These are part of the card's identity */
    /**
     * The database ID of the card.
     */
    public deckCardId?: string;

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

    public get oppositeTeam(): CardTeam {
        return this.team === CardTeam.Player ? CardTeam.Enemy : CardTeam.Player;
    }

    constructor(deckCardId?: string, health?: number, damage?: number) {
        if (new.target === CardBase) {
            throw new Error("Cannot instantiate abstract class CardBase");
        }
        this.deckCardId = deckCardId;
        this.health = health ?? this.metadata.baseHealth;
        this.damage = damage ?? this.metadata.baseDamage;
    }

    static get metadata(): CardMetadata {
        throw new Error(`Metadata not implemented on \`${this.name}'`);
    }

    get metadata(): CardMetadata {
        /* this is somewhat not type safe, but regardless */
        return (this.constructor as any).metadata as CardMetadata;
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
        this.changeHealth(-amount);
    }

    /**
     * Heals the card.
     * @param amount The amount of health to heal.
     */
    heal(amount: number): void {
        this.changeHealth(amount);
    }

    /**
     * Heals the card.
     * @param amount The amount of health to heal.
     */
    changeHealth(amount: number): void {
        const event = new HealthChangedEvent();
        event.card = this;
        event.delta = amount;
        this.game.broadcast(event);

        if (event.cancelled) {
            return;
        }

        this.health += event.delta;
        if (this.health <= 0) {
            const event = new CardDiedEvent();
            event.card = this;
            this.game.broadcast(event);

            // if some card healed us, don't die
            if (this.health <= 0) {
                this.state = CardState.Dead;
            }
        }
    }

    changeDamage(amount: number): void {
        this.damage += amount;
    }

    /**
     * Called when an event is broadcasted.
     * This function can mutate the event, in order
     * of cards in the deck.
     * @param event The event to handle.
     */
    onEvent(event: GameEvent): void {}

    /**
     * Called in the same order as onEvent after all mutations have occured.
     * @param event The event to handle.
     */
    onEventLate(event: Readonly<GameEvent>): void {}

    clone(): CardBase {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }
}

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
}

export class GameEvent {
    #cancelled: boolean = false;
    get cancelled(): boolean {
        return this.#cancelled;
    }
    set cancelled(value: boolean) {
        if (!this.cancellable) {
            throw new Error(`Cannot cancel ${this.type} event`);
        }
        this.#cancelled = value;
    }

    get cancellable(): boolean {
        return true;
    }

    get type(): GameEventType {
        return null;
    }
}

/**
 * Fired when the round is started. Note that
 * this is called on the first *step*, not on construction.
 */
export class RoundStartEvent extends GameEvent {
    get cancellable(): boolean {
        return false;
    }

    get type(): GameEventType {
        return GameEventType.RoundStart;
    }
}

export class HealthChangedEvent extends GameEvent {
    public card: CardBase;
    public delta: number;

    get type(): GameEventType {
        return GameEventType.HealthChanged;
    }
}

export class CardDiedEvent extends GameEvent {
    public card: CardBase;

    get type(): GameEventType {
        return GameEventType.CardDied;
    }
}

export class RoundEndEvent extends GameEvent {
    get cancellable(): boolean {
        return false;
    }

    get type(): GameEventType {
        return GameEventType.RoundEnd;
    }
}

export enum GameState {
    Running,
    Over,
}

export enum WinState {
    Player,
    Enemy,
    Stalemate,
}

export class Game {
    public playerDeck: CardBase[];
    public enemyDeck: CardBase[];

    public gameState: GameState = GameState.Running;
    public winState: WinState = WinState.Stalemate;

    public actions: Action[] = [];

    constructor(playerDeck: CardBase[], enemyDeck: CardBase[]) {
        this.playerDeck = playerDeck;
        this.enemyDeck = enemyDeck;

        this.#forEachCard((card, team) => {
            card.game = this;
            card.team = team;
        });

        const event = new RoundStartEvent();
        this.broadcast(event);

        // update win state immediately
        // for the edge cases of the player/enemy
        // having no cards at the start of the game
        this.#updateWinState();
    }

    /**
     * Runs a single step of the game.
     * This is either
     * 	- a single action
     *  - an attack
     * @returns The resuling game state.
     */
    step(): GameState {
        // update win state and return early if game is already over
        // note: this is somewhat redundant, but it makes the code easier to read
        if (this.gameState === GameState.Over) {
            return this.gameState;
        }

        const action = this.dequeueAction();
        action.exec();

        // remove all dead cards
        this.playerDeck = this.playerDeck.filter(
            (card) => card.state !== CardState.Dead,
        );
        this.enemyDeck = this.enemyDeck.filter(
            (card) => card.state !== CardState.Dead,
        );

        // update win state again
        this.#updateWinState();
        return this.gameState;
    }

    peekAction(): Action {
        return this.actions.at(0) ?? new AttackAction(this);
    }

    enqueueAction(action: Action): void {
        this.actions.push(action);
    }

    dequeueAction(): Action {
        return this.actions.shift() ?? new AttackAction(this);
    }

    #updateWinState(): void {
        if (this.playerDeck.length === 0 && this.enemyDeck.length === 0) {
            this.gameState = GameState.Over;
            this.winState = WinState.Stalemate;
        } else if (this.playerDeck.length === 0) {
            this.gameState = GameState.Over;
            this.winState = WinState.Enemy;
        } else if (this.enemyDeck.length === 0) {
            this.gameState = GameState.Over;
            this.winState = WinState.Player;
        }
    }

    #forEachCard(callback: (card: CardBase, cardTeam: CardTeam) => void): void {
        this.playerDeck.forEach((card) => callback(card, CardTeam.Player));
        this.enemyDeck.forEach((card) => callback(card, CardTeam.Enemy));
    }

    *getCards() {
        yield* this.playerDeck;
        yield* this.enemyDeck;
    }

    getDeck(team: CardTeam): CardBase[] {
        return team === CardTeam.Player ? this.playerDeck : this.enemyDeck;
    }

    broadcast(event: GameEvent): void {
        const cards = [...this.getCards()];
        for (const card of cards) {
            card.onEvent(event);
            if (event.cancelled) {
                return;
            }
        }
        for (const card of cards) {
            card.onEventLate(event);
        }
    }

    spawn(card: CardBase, team: CardTeam, idx: number): void {
        card.team = team;
        card.game = this;
        card.state = CardState.Alive;
        this.getDeck(team).splice(idx, 0, card);
    }

    indexOfCard(card: CardBase): number {
        return this.getDeck(card.team).indexOf(card);
    }

    printDeck(deck: CardBase[]): string {
        if (deck.length === 0) {
            return "No cards";
        }

        const padBoth = (str: string, len: number): string => {
            // const leftPad = Math.floor((len - str.length) / 2);
            // const rightPad = len - str.length - leftPad;
            // return " ".repeat(leftPad) + str + " ".repeat(rightPad);
            return str
                .padStart(Math.floor((len - str.length) / 2) + str.length)
                .padEnd(len);
        };

        let out = "";
        const cardWidths = deck.map(
            (card) =>
                Math.max(
                    card.metadata.name.length,
                    card.health.toString().length +
                        card.damage.toString().length +
                        3,
                ) + 2,
        );

        deck.forEach((card, i) => {
            out += " " + padBoth(i.toString(), cardWidths[i]);
            if (i === deck.length - 1) {
                out += " ";
            }
        });
        out += "\n";

        const line = "-".repeat(
            cardWidths.reduce((a, b) => a + b, 0) + deck.length + 1,
        );
        out += line + "\n";

        deck.forEach((card, i) => {
            const str = " " + card.metadata.name + " ";
            out += "|" + padBoth(str, cardWidths[i]);
            if (i === deck.length - 1) {
                out += "|";
            }
        });
        out += "\n";
        deck.forEach((card, i) => {
            const str =
                " " + card.health.toString() + " / " + card.damage + " ";
            out += "|" + padBoth(str, cardWidths[i]);
            if (i === deck.length - 1) {
                out += "|";
            }
        });

        out += "\n";
        out += line;

        return out;
    }

    print(): void {
        const player = this.printDeck(this.playerDeck).split("\n");
        const enemy = this.printDeck(this.enemyDeck).split("\n");

        let out = "Player".padEnd(player[0].length + 4) + "Enemy" + "\n";
        for (let i = 0; i < Math.max(player.length, enemy.length); i++) {
            const playerLine = player[i] ?? " ".repeat(player[0].length);
            const enemyLine = enemy[i] ?? " ".repeat(enemy[0].length);
            out += playerLine + " ".repeat(4) + enemyLine + "\n";
        }

        out += "Game State: " + this.gameState + "\n";
        out += "Win State: " + this.winState + "\n";
        out += "Actions: " + this.actions.map((a) => a.toString()) + "\n";
        console.log(out);
    }
}
