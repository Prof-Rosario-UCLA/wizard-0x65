import { ChangeHealthAction, SwapHealthAction } from "./actions";
import {
    CardBase,
    CardDiedEvent,
    CardMetadata,
    Game,
    GameEvent,
    GameEventType,
    GameState,
    HealthChangedEvent,
    RoundStartEvent as RoundStartedEvent,
    WinState,
} from "./simulation";

class TestCard extends CardBase {
    static get metadata(): CardMetadata {
        return {
            id: "test_card",
            name: "Test Card",
            description: "",
            baseHealth: 4,
            baseDamage: 2,
            price: 0,
        };
    }
}

class EventLoggerCard extends TestCard {
    startedEvents: RoundStartedEvent[] = [];
    cardHealthChangedEvents: HealthChangedEvent[] = [];
    cardDiedEvents: CardDiedEvent[] = [];

    onEvent(event: GameEvent): void {
        if (event instanceof RoundStartedEvent) {
            this.startedEvents.push(event as RoundStartedEvent);
        }
        if (event instanceof HealthChangedEvent) {
            this.cardHealthChangedEvents.push(event as HealthChangedEvent);
        }
        if (event instanceof CardDiedEvent) {
            this.cardDiedEvents.push(event as CardDiedEvent);
        }
    }
}

class FriendlyDamageHalverCard extends TestCard {
    onEvent(event: GameEvent): void {
        if (event instanceof HealthChangedEvent) {
            if (event.card.team !== this.team || event.delta > 0) {
                return;
            }

            event.delta = Math.floor(event.delta / 2);
        }
    }
}

class ReviveSelfCard extends TestCard {
    #revived = false;

    onEvent(event: GameEvent): void {
        if (this.#revived) return;
        if (event instanceof CardDiedEvent) {
            if (event.card !== this) {
                return;
            }

            this.health = 1;
            event.cancelled = true;

            this.#revived = true;
        }
    }
}

class SpawnCardOnStart extends TestCard {
    onEvent(event: GameEvent): void {
        if (event instanceof RoundStartedEvent) {
            const card = new TestCard("spawn", 1, 1);
            card.team = this.team;
            this.game.spawn(card, this.team, this.game.indexOfCard(this));
        }
    }
}

describe("Simulation", () => {
    describe("Starting with no cards", () => {
        test("Enemy loss", () => {
            const playerDeck = [];
            const enemyDeck = [new TestCard("", 1, 1)];

            const game = new Game(playerDeck, enemyDeck);

            expect(game.gameState).toBe(GameState.Over);
            expect(game.winState).toBe(WinState.Enemy);

            expect(game.step()).toBe(GameState.Over);
        });

        test("Enemy loss", () => {
            const playerDeck = [new TestCard("", 1, 1)];
            const enemyDeck = [];

            const game = new Game(playerDeck, enemyDeck);

            expect(game.gameState).toBe(GameState.Over);
            expect(game.winState).toBe(WinState.Player);

            expect(game.step()).toBe(GameState.Over);
        });

        test("Stalemate", () => {
            const playerDeck = [];
            const enemyDeck = [];

            const game = new Game(playerDeck, enemyDeck);

            expect(game.gameState).toBe(GameState.Over);
            expect(game.winState).toBe(WinState.Stalemate);

            expect(game.step()).toBe(GameState.Over);
        });
    });

    describe("Attacks", () => {
        test("Player attacks enemy", () => {
            const playerDeck = [new TestCard("", 4, 2)];
            const enemyDeck = [new TestCard("", 5, 2)];

            const game = new Game(playerDeck, enemyDeck);

            expect(game.gameState).toBe(GameState.Running);

            // turn 1: 4 -> 2, 5 -> 3
            expect(game.step()).toBe(GameState.Running);

            expect(game.playerDeck.length).toBe(1);
            expect(game.playerDeck[0].health).toBe(2);

            expect(game.enemyDeck.length).toBe(1);
            expect(game.enemyDeck[0].health).toBe(3);

            // turn 2: 1 -> dead, 3 -> 1
            expect(game.step()).toBe(GameState.Over);
            expect(game.playerDeck.length).toBe(0);
            expect(game.enemyDeck.length).toBe(1);
            expect(game.enemyDeck[0].health).toBe(1);
            expect(game.winState).toBe(WinState.Enemy);
        });
    });

    describe("Events", () => {
        test("Round started, health changed, card died", () => {
            const playerCard = new EventLoggerCard("", 4, 2);
            const playerDeck = [playerCard];
            const enemyDeck = [new TestCard("", 5, 3)];

            const startedEvents = playerCard.startedEvents;
            const cardHealthChangedEvents = playerCard.cardHealthChangedEvents;
            const cardDiedEvents = playerCard.cardDiedEvents;

            const game = new Game(playerDeck, enemyDeck);

            expect(game.gameState).toBe(GameState.Running);
            expect(startedEvents.length).toBe(1);

            expect(game.step()).toBe(GameState.Running);
            expect(cardHealthChangedEvents.length).toBe(2);
            expect(cardDiedEvents.length).toBe(0);

            expect(cardHealthChangedEvents[0].card).toBe(enemyDeck[0]);
            expect(cardHealthChangedEvents[0].delta).toBe(-2);
            expect(cardHealthChangedEvents[1].card).toBe(playerDeck[0]);
            expect(cardHealthChangedEvents[1].delta).toBe(-3);

            startedEvents.length = 0;
            cardHealthChangedEvents.length = 0;
            cardDiedEvents.length = 0;

            expect(game.step()).toBe(GameState.Over);
            expect(startedEvents.length).toBe(0);
            expect(cardHealthChangedEvents.length).toBe(2);
            expect(cardDiedEvents.length).toBe(1);

            expect(cardHealthChangedEvents[0].card).toBe(enemyDeck[0]);
            expect(cardHealthChangedEvents[1].card).toBe(playerCard);

            expect(cardDiedEvents[0].card).toBe(playerCard);
        });
    });

    describe("Modifying events", () => {
        test("Modifying health changed event", () => {
            const playerDeck = [new TestCard("", 4, 2)];
            const enemyDeck = [new FriendlyDamageHalverCard("", 5, 3)];

            const game = new Game(playerDeck, enemyDeck);

            expect(game.gameState).toBe(GameState.Running);

            expect(game.step()).toBe(GameState.Running);
            expect(game.playerDeck.length).toBe(1);
            expect(game.enemyDeck[0].health).toBe(4);
        });

        test("Revive card", () => {
            const playerDeck = [new ReviveSelfCard("", 1, 1)];
            const enemyDeck = [new TestCard("", 3, 1)];

            const game = new Game(playerDeck, enemyDeck);

            expect(game.step()).toBe(GameState.Running);
            expect(game.playerDeck.length).toBe(1);
            expect(game.playerDeck[0].health).toBe(1);

            expect(game.step()).toBe(GameState.Over);
            expect(game.playerDeck.length).toBe(0);
        });
    });

    describe("Spawning cards", () => {
        test("Spawn card on start", () => {
            const playerCard = new SpawnCardOnStart("", 1, 1);
            const playerDeck = [playerCard];
            const enemyDeck = [new TestCard("", 3, 1)];

            const game = new Game(playerDeck, enemyDeck);
            expect(game.playerDeck.length).toBe(2);
            expect(game.playerDeck[0].deckCardId).toBe("spawn");

            // check that simulation still works
            expect(game.step()).toBe(GameState.Running);
            expect(game.playerDeck.length).toBe(1);
            expect(game.playerDeck[0]).toBe(playerCard);
        });
    });

    describe("Actions", () => {
        test("Damage action", () => {
            const playerDeck = [new TestCard("", 4, 2)];
            const enemyDeck = [new TestCard("", 5, 3)];

            const game = new Game(playerDeck, enemyDeck);

            const action = new ChangeHealthAction(game, playerDeck[0], -1);

            game.enqueueAction(action);
            expect(game.actions.length).toBe(1);
            expect(game.peekAction()).toBe(action);

            expect(game.step()).toBe(GameState.Running);
            expect(game.playerDeck.length).toBe(1);
            expect(game.enemyDeck.length).toBe(1);
            expect(game.playerDeck[0].health).toBe(3);
            expect(game.enemyDeck[0].health).toBe(5);
        });

        test("Swap health action", () => {
            const playerDeck = [new TestCard("", 4, 2)];
            const enemyDeck = [new TestCard("", 5, 3)];

            const game = new Game(playerDeck, enemyDeck);

            game.enqueueAction(new SwapHealthAction(game, playerDeck[0]));
            game.enqueueAction(new SwapHealthAction(game, enemyDeck[0]));

            expect(game.step()).toBe(GameState.Running);
            expect(game.step()).toBe(GameState.Running);

            expect(game.playerDeck.length).toBe(1);
            expect(game.enemyDeck.length).toBe(1);

            expect(game.playerDeck[0].health).toBe(2);
            expect(game.playerDeck[0].damage).toBe(4);

            expect(game.enemyDeck[0].health).toBe(3);
            expect(game.enemyDeck[0].damage).toBe(5);
        });
    });

    describe("Printing", () => {
        test("Print game state (long name)", () => {
            class MyCard extends CardBase {
                static get metadata(): CardMetadata {
                    return {
                        id: "my_card",
                        name: "My Card",
                        description: "",
                        baseHealth: 4,
                        baseDamage: 2,
                        price: 0,
                    };
                }
            }
            const playerDeck = [new MyCard("", 4, 2)];

            const game = new Game(playerDeck, []);

            expect(game.printDeck(playerDeck)).toBe(
                `     0     \n-----------\n| My Card |\n|  4 / 2  |\n-----------`,
            );
        });
        test("Print game state (short name)", () => {
            class MyCard extends CardBase {
                static get metadata(): CardMetadata {
                    return {
                        id: "my_card",
                        name: "a",
                        description: "",
                        baseHealth: 4,
                        baseDamage: 2,
                        price: 0,
                    };
                }
            }

            const playerDeck = [new MyCard("", 4, 2)];
            const game = new Game(playerDeck, []);

            expect(game.printDeck(playerDeck)).toBe(
                `    0    \n---------\n|   a   |\n| 4 / 2 |\n---------`,
            );
        });
        test("Print game state (multiple cards)", () => {
            class MyCard extends CardBase {
                static get metadata(): CardMetadata {
                    return {
                        id: "my_card",
                        name: "My Card",
                        description: "",
                        baseHealth: 4,
                        baseDamage: 2,
                        price: 0,
                    };
                }
            }

            const playerDeck = [new MyCard("", 4, 2), new MyCard("", 5, 3)];
            const game = new Game(playerDeck, []);

            expect(game.printDeck(playerDeck)).toBe(
                `     0         1     \n---------------------\n| My Card | My Card |\n|  4 / 2  |  5 / 3  |\n---------------------`,
            );
        });
    });
});
