import { text } from "stream/consumers";
import {
    BombCard,
    cards,
    CCard,
    JavaCard,
    TempleOSCard as TempleOSCard,
    UnrealCard,
    VimCard,
} from "./cards";
import { Game, GameState } from "./simulation";
import { ChangeHealthAction } from "./actions";

describe("Cards", () => {
    test("Cards have correct IDs", () => {
        Object.entries(cards).forEach(([id, card]) => {
            expect(card.metadata.id).toBe(id);
        });
    });

    test("C Card", () => {
        const playerCard = new CCard("", 1, 1);
        const enemyCard = new CCard("", 1, 1);
        const playerDeck = [playerCard];
        const enemyDeck = [enemyCard];

        const game = new Game(playerDeck, enemyDeck);

        expect(game.gameState).toBe(GameState.Running);
        expect(game.playerDeck.length).toBe(1);
        expect(game.enemyDeck.length).toBe(1);
        expect(game.playerDeck[0].health).toBe(1);
        expect(game.playerDeck[0].damage).toBe(1);

        game.step();

        expect(game.playerDeck.length).toBe(1);
        expect(game.enemyDeck.length).toBe(1);
        expect(game.playerDeck[0].health).toBe(1);
        expect(game.playerDeck[0].damage).toBe(1);

        // Spawns a *new* card
        expect(game.playerDeck[0]).not.toBe(playerCard);
        expect(game.playerDeck[0].health).toBe(1);
        expect(game.playerDeck[0].damage).toBe(1);

        expect(game.enemyDeck[0]).not.toBe(enemyCard);
        expect(game.enemyDeck[0].health).toBe(1);
        expect(game.enemyDeck[0].damage).toBe(1);

        // makes sure it doesn't spawn again
        game.step();
        expect(game.gameState).toBe(GameState.Over);
    });

    test("Unreal Card", () => {
        const playerCard = new UnrealCard("", 8, 1);
        // we expect this to dead 3 damage to unreal
        const enemyCard = new CCard("", 8, 5);
        const playerDeck = [playerCard];
        const enemyDeck = [enemyCard];

        const game = new Game(playerDeck, enemyDeck);

        game.step();
        expect(playerDeck.length).toBe(1);
        expect(playerDeck[0].health).toBe(5);
    });

    test("Vim Card", () => {
        const playerDeck = [
            new CCard("", 1, 1),
            new CCard("", 1, 1),
            new VimCard("", 1, 1),
        ];
        const enemyDeck = [
            new CCard("", 1, 1),
            new CCard("", 1, 1),
            new CCard("", 1, 1),
        ];

        const game = new Game(playerDeck, enemyDeck);
        expect(game.playerDeck.length).toBe(3);
        expect(game.playerDeck[0].health).toBe(1);
        expect(game.playerDeck[1].health).toBe(1);
        expect(game.playerDeck[2].health).toBe(1);

        expect(game.enemyDeck.length).toBe(3);
        expect(game.enemyDeck[0].health).toBe(1);
        expect(game.enemyDeck[1].health).toBe(1);
        expect(game.enemyDeck[2].health).toBe(1);

        expect(game.actions.length).toBe(3);

        game.step();
        game.step();
        game.step();

        expect(game.playerDeck.length).toBe(3);
        expect(game.playerDeck[0].health).toBe(2);
        expect(game.playerDeck[1].health).toBe(2);
        expect(game.playerDeck[2].health).toBe(2);

        expect(game.enemyDeck.length).toBe(3);
        expect(game.enemyDeck[0].health).toBe(1);
        expect(game.enemyDeck[1].health).toBe(1);
        expect(game.enemyDeck[2].health).toBe(1);
    });

    test("TempleOS", () => {
        const playerDeck = [new TempleOSCard("", 1, 1)];
        const enemyDeck = [new CCard("", 1, 1)];

        const game = new Game(playerDeck, enemyDeck);
        expect(game.gameState).toBe(GameState.Running);
        expect(game.playerDeck.length).toBe(1);

        expect(game.actions.length).toBe(1);

        game.step();
        expect(game.gameState).toBe(GameState.Over);
        expect(game.playerDeck.length).toBe(0);
    });

    test("Java", () => {
        const playerDeck = [new JavaCard("", 2, 1)];
        const enemyDeck = [new CCard("", 2, 1)];

        const game = new Game(playerDeck, enemyDeck);

        expect(game.gameState).toBe(GameState.Running);
        expect(game.actions.length).toBe(6); // spawns 6 bombs

        expect(game.step()).toBe(GameState.Running);
        expect(game.playerDeck.length).toBe(2);
        expect(game.playerDeck[0].metadata.id).toBe(BombCard.metadata.id);
        expect(game.playerDeck[1].metadata.id).toBe(JavaCard.metadata.id);

        expect(game.step()).toBe(GameState.Running);
        expect(game.playerDeck.length).toBe(3);
        expect(game.playerDeck[0].metadata.id).toBe(BombCard.metadata.id);
        expect(game.playerDeck[1].metadata.id).toBe(JavaCard.metadata.id);
        expect(game.playerDeck[2].metadata.id).toBe(BombCard.metadata.id);

        expect(game.step()).toBe(GameState.Running);
        expect(game.playerDeck.length).toBe(4);
        expect(game.playerDeck[0].metadata.id).toBe(BombCard.metadata.id);
        expect(game.playerDeck[1].metadata.id).toBe(BombCard.metadata.id);
        expect(game.playerDeck[2].metadata.id).toBe(JavaCard.metadata.id);
        expect(game.playerDeck[3].metadata.id).toBe(BombCard.metadata.id);

        expect(game.step()).toBe(GameState.Running);
        expect(game.enemyDeck.length).toBe(2);
        expect(game.enemyDeck[0].metadata.id).toBe(BombCard.metadata.id);
        expect(game.enemyDeck[1].metadata.id).toBe(CCard.metadata.id);

        expect(game.step()).toBe(GameState.Running);
        expect(game.enemyDeck.length).toBe(3);
        expect(game.enemyDeck[0].metadata.id).toBe(BombCard.metadata.id);
        expect(game.enemyDeck[1].metadata.id).toBe(CCard.metadata.id);
        expect(game.enemyDeck[2].metadata.id).toBe(BombCard.metadata.id);

        expect(game.step()).toBe(GameState.Running);
        expect(game.enemyDeck.length).toBe(4);
        expect(game.enemyDeck[0].metadata.id).toBe(BombCard.metadata.id);
        expect(game.enemyDeck[1].metadata.id).toBe(BombCard.metadata.id);
        expect(game.enemyDeck[2].metadata.id).toBe(CCard.metadata.id);
        expect(game.enemyDeck[3].metadata.id).toBe(BombCard.metadata.id);

        expect(game.step()).toBe(GameState.Running);
        expect(game.actions.length).toBe(2);
        expect(game.actions[0]).toBeInstanceOf(ChangeHealthAction);
        expect(game.actions[1]).toBeInstanceOf(ChangeHealthAction);

        expect(game.step()).toBe(GameState.Running); // player bomb explodes
        expect(game.step()).toBe(GameState.Running); // enemy bomb explodes

        expect(game.actions.length).toBe(2);
        expect(game.step()).toBe(GameState.Running); // player bomb explodes
        expect(game.step()).toBe(GameState.Running); // enemy bomb explodes

        // check that exploded bombs damaged cards
        expect(game.playerDeck.length).toBe(2);
        expect(game.playerDeck[0].metadata.id).toBe(JavaCard.metadata.id);
        expect(game.playerDeck[0].health).toBe(1);

        expect(game.enemyDeck.length).toBe(2);
        expect(game.enemyDeck[0].metadata.id).toBe(CCard.metadata.id);
        expect(game.enemyDeck[0].health).toBe(1);
    });
});
