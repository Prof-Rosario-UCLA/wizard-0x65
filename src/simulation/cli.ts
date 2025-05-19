import { program } from "commander";
import { CardBase, Game, GameState } from "./simulation";
import { cards } from "./cards";
import Readline from "node:readline/promises";

program
    .name("wizard-0x65-simulator")
    .description("Simulate wizard-0x65 card game on the command line")
    .showHelpAfterError()
    .requiredOption(
        "-p, --player <cards...>",
        'Player deck, in the format "cardId" or "cardId:health:damage"',
    )
    .requiredOption("-e, --enemy <cards...>", "Enemy deck");

program.parse(process.argv);

const { player, enemy }: { player: string[]; enemy: string[] } = program.opts();

function createCard(input: string): CardBase {
    const parts = input.split(":");
    const cardId = parts[0];
    const health = parts[1] ? parseInt(parts[1]) : undefined;
    const damage = parts[2] ? parseInt(parts[2]) : undefined;

    if (!(cardId in cards)) {
        console.error(`Card ${cardId} not found`);
        process.exit(1);
    }

    const CardClass = cards[cardId];
    if (!CardClass) {
        throw new Error(`Card ${cardId} not found`);
    }

    return new CardClass(cardId, health, damage);
}

const playerDeck = player.map(createCard);
const enemyDeck = enemy.map(createCard);

const game = new Game(playerDeck, enemyDeck);

game.print();

const readline = Readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function main() {
    while (game.gameState === GameState.Running) {
        // wait for enter
        const input = await readline.question("Press enter to continue...");
        game.step();
        game.print();
    }
    readline.close();
}

main();
