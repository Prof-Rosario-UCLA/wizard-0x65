"use server";

import { getPlayer } from "./auth";
import { prisma } from "./db";
import {
    DeckCard,
    GameStatus,
    RoundStatus,
    PrismaClient,
} from "./app/generated/prisma";
import { cards } from "./simulation/cards";
import { Deck } from "./app/types";
import { Game, GameState, WinState } from "./simulation/simulation";

function getRandomCard() {
    const cardIds = Object.keys(cards);
    return cardIds[Math.floor(Math.random() * cardIds.length)];
}

function generateShop() {
    return Array.from({ length: 8 }, (_, i) => ({
        cardId: getRandomCard(),
        position: i,
    }));
}

function generateDeck() {
    return Array.from({ length: 4 }, (_, i) => ({
        id: getRandomCard(),
        position: i,
    }));
}

export async function getRandomDeckId(
    prisma: Pick<PrismaClient, "$queryRaw" | "deck">,
) {
    const [deckCard] = await prisma.$queryRaw<
        [{ deckId: number } | undefined]
    >`SELECT "deckId" FROM "DeckCard" GROUP BY "deckId" HAVING count(*) = 4 ORDER BY RANDOM() LIMIT 1`;

    if (deckCard) return deckCard.deckId;
}

export async function createGame() {
    const player = await getPlayer({ shouldRedirect: false });
    if (!player) throw new Error("Not logged in.");

    return prisma.$transaction(async (tx) => {
        const randomDeckId = await getRandomDeckId(tx);

        return tx.game.create({
            data: {
                status: GameStatus.IN_PROGRESS,
                playerId: player.id,
                rounds: {
                    create: {
                        number: 0,
                        bytes: 8,
                        health: 3,
                        status: RoundStatus.IN_PROGRESS,
                        playerDeck: { create: {} },
                        enemyDeck: randomDeckId
                            ? { connect: { id: randomDeckId } }
                            : {
                                  create: {
                                      cards: {
                                          create: generateDeck(),
                                      },
                                  },
                              },
                        shopCards: { create: generateShop() },
                    },
                },
            },
        });
    });
}

export async function addCardToDeck({
    gameId,
    cardId,
    position,
}: {
    gameId: number;
    cardId: string;
    position: number;
}) {
    if (position >= 4)
        throw new Error("Cannot change the card in this position.");

    const player = await getPlayer();

    if (!player) throw new Error("Must be logged in.");

    await prisma.$transaction(async (tx) => {
        const game = await tx.game.findUnique({
            where: { playerId: player?.id, id: gameId },
            include: {
                rounds: {
                    orderBy: { number: "desc" },
                    take: 1,
                },
            },
        });
        const latestRound = game?.rounds[0];
        if (!game || !latestRound) throw new Error("Game not found.");
        if (game.status !== GameStatus.IN_PROGRESS)
            throw new Error("Deck cannot be edited.");

        await tx.deckCard.upsert({
            where: {
                deckId_position: { deckId: latestRound.playerDeckId, position },
            },
            create: {
                id: cardId,
                deckId: latestRound.playerDeckId,
                position,
            },
            update: {
                id: cardId,
            },
        });
    });
}

export async function getGameState(gameId: number) {
    const player = await getPlayer({ shouldRedirect: false });
    if (!player) return null;

    const game = await prisma.game.findUnique({
        where: {
            playerId: player.id,
            id: gameId,
        },
        include: {
            rounds: {
                orderBy: { number: "asc" },
                include: {
                    shopCards: {
                        orderBy: { position: "asc" },
                        select: { cardId: true },
                    },
                    playerDeck: {
                        include: {
                            cards: {
                                orderBy: { position: "asc" },
                            },
                        },
                    },
                },
            },
        },
    });

    const latestRound = game?.rounds[game.rounds.length - 1];
    if (!game || !latestRound) return null;

    const deck: Deck = Array.from({ length: 4 }, () => null);
    for (const card of latestRound.playerDeck.cards) {
        deck[card.position] = card;
    }
    return {
        id: game.id,
        status: game.status,
        deck,
        rounds: game.rounds,
        shop: latestRound.shopCards,
        roundStatus: latestRound.status,
        bytes: latestRound.bytes,
        health: latestRound.health,
    };
}

export async function buyCard(gameId: number, cardCost: number) {
    const player = await getPlayer({ shouldRedirect: false });
    if (!player) return { success: false, error: "Player not found" };

    const game = await prisma.game.findUnique({
        where: {
            playerId: player.id,
            id: gameId,
        },
        include: {
            rounds: {
                orderBy: { number: "asc" },
            },
        },
    });

    if (!game || game.rounds.length === 0) {
        return { success: false, error: "Game or round not found" };
    }

    const latestRound = game.rounds[game.rounds.length - 1];
    const newBytes = latestRound.bytes - cardCost;

    if (newBytes < 0) {
        return { success: false, error: "Not enough bytes" };
    }

    await prisma.round.update({
        where: { id: latestRound.id },
        data: { bytes: newBytes },
    });

    return { success: true, bytes: newBytes };
}

export async function sellCard(gameId: number, refundAmount: number) {
    const player = await getPlayer({ shouldRedirect: false });
    if (!player) return { success: false, error: "Player not found" };

    const game = await prisma.game.findUnique({
        where: {
            playerId: player.id,
            id: gameId,
        },
        include: {
            rounds: {
                orderBy: { number: "asc" },
                include: {
                    playerDeck: {
                        include: {
                            cards: {
                                orderBy: { position: "asc" },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!game || game.rounds.length === 0) {
        return { success: false, error: "Game or round not found" };
    }

    const latestRound = game.rounds[game.rounds.length - 1];

    const newBytes = latestRound.bytes + refundAmount;
    await prisma.round.update({
        where: { id: latestRound.id },
        data: { bytes: newBytes },
    });

    return { success: true, bytes: newBytes };
}

export type ClientGameState = NonNullable<
    Awaited<ReturnType<typeof getGameState>>
>;

function winStateToRoundStatus(winState: WinState): RoundStatus {
    switch (winState) {
        case WinState.Player:
            return RoundStatus.WIN;
        case WinState.Enemy:
            return RoundStatus.LOSE;
        case WinState.Stalemate:
            return RoundStatus.DRAW;
    }
}

export async function beginRound(gameId: number) {
    const player = await getPlayer({ shouldRedirect: false });
    if (!player) throw new Error("Must be logged in.");

    const gameState = await prisma.game.findUnique({
        where: { id: gameId },
        include: {
            rounds: {
                orderBy: { number: "desc" },
                take: 1,
                include: {
                    enemyDeck: { include: { cards: true } },
                    playerDeck: { include: { cards: true } },
                },
            },
        },
    });
    const latestRound = gameState?.rounds[0];
    if (!latestRound) throw new Error("Game not found.");
    if (latestRound.status !== RoundStatus.IN_PROGRESS)
        throw new Error("Cannot begin a round that is not in progress.");

    const playerDeck = latestRound.playerDeck.cards.map((card: DeckCard) => {
        const Card = cards[card.id];
        return new Card();
    });
    const enemyDeck = latestRound.enemyDeck.cards.map((card: DeckCard) => {
        const Card = cards[card.id];
        return new Card();
    });
    const game = new Game(playerDeck, enemyDeck);

    while (game.gameState !== GameState.Over) game.step();

    return prisma.$transaction(async (tx) => {
        const randomDeckId = await getRandomDeckId(tx);

        const newHealth =
            game.winState === WinState.Enemy
                ? latestRound.health - 1
                : latestRound.health;
        const isOver = newHealth <= 0;

        return prisma.game.update({
            where: { id: gameId },
            data: {
                status: isOver ? GameStatus.COMPLETED : GameStatus.IN_PROGRESS,
                rounds: {
                    update: {
                        where: {
                            id: latestRound.id,
                            status: RoundStatus.IN_PROGRESS,
                        },
                        data: {
                            health: newHealth,
                            status: winStateToRoundStatus(game.winState),
                        },
                    },
                    create: isOver
                        ? undefined
                        : {
                              number: latestRound.number + 1,
                              bytes: latestRound.bytes,
                              health: newHealth,
                              status: RoundStatus.IN_PROGRESS,
                              playerDeck: {
                                  create: {
                                      cards: {
                                          create: latestRound.playerDeck.cards.map(
                                              (card) => ({
                                                  id: card.id,
                                                  position: card.position,
                                              }),
                                          ),
                                      },
                                  },
                              },
                              enemyDeck: { connect: { id: randomDeckId } },
                              shopCards: { create: generateShop() },
                          },
                },
            },
        });
    });
}

export async function getAverageGameLength() {
    const player = await getPlayer({ shouldRedirect: false });
    if (!player) throw new Error("Must be logged in.");

    const [{ avg }] = await prisma.$queryRaw<[{ avg: number | null }]>`
        SELECT AVG(round_count)
        FROM (
            SELECT COUNT(*) AS round_count
            FROM "Round"
            INNER JOIN "Game" ON "Round"."gameId" = "Game"."id"
            WHERE "Game"."playerId" = ${player.id}
            GROUP BY "Round"."gameId"
        )
    `;

    return avg;
}
