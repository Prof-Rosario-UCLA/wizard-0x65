import { getPlayer } from "~/auth";
import { prisma } from "~/db";
import { Shop } from "./shop";
import { cards } from "~/simulation/cards";
import { Simulation } from "./simulation";

async function getGameState(gameId: number) {
    const player = await getPlayer();
    if (!player) return null;

    const gameState = await prisma.game.findUnique({
        where: {
            playerId: player.id,
            id: gameId,
        },
        include: {
            rounds: {
                orderBy: { number: "desc" },
                take: 1,
                include: {
                    shopCards: {
                        orderBy: { position: "asc" },
                        select: { cardId: true },
                    },
                    playerDeck: {
                        include: {
                            cards: {
                                orderBy: { position: "asc" },
                                select: { id: true },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!gameState) return null;

    const latestRound = gameState.rounds[0];
    if (!latestRound) return null;

    return {
        status: gameState.status,
        deck: latestRound.playerDeck?.cards,
        shop: latestRound.shopCards,
        roundStatus: latestRound.status,
    };
}

export async function GameController({ gameId }: { gameId: number }) {
    const gameState = await getGameState(gameId);

    if (!gameState) return <div className="text-center">Game not found.</div>;

    const { status, deck = [], shop } = gameState;
    if (status === "SHOP") {
        return (
            <Shop
                cards={shop.map((card) => cards[card.cardId].metadata)}
                deck={deck.map((card) => cards[card.id].metadata)}
            />
        );
    }

    return <Simulation />;
}
