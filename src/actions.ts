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
import redis from "./redis";

export async function invalidateGameCache(gameId: number) {
    await redis.del(`game:${gameId}`);
}

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

function parseDBDeck(cards: DeckCard[]): Deck {
    const deck: Deck = Array.from({ length: 4 }, () => null);
    for (const card of cards) {
        deck[card.position] = card;
    }
    return deck;
}

async function getGameStateDB(gameId: number, playerId: number) {
    const game = await prisma.game.findUnique({
        where: {
            playerId,
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
                    enemyDeck: {
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

    const playerDeck = parseDBDeck(latestRound.playerDeck.cards);
    const enemyDeck = parseDBDeck(latestRound.enemyDeck.cards);

    return {
        id: game.id,
        playerId,
        status: game.status,
        playerDeck,
        enemyDeck,
        rounds: game.rounds,
        shop: latestRound.shopCards,
        roundStatus: latestRound.status,
        bytes: latestRound.bytes,
        health: latestRound.health,
    };
}

export type ClientGameState = NonNullable<
    Awaited<ReturnType<typeof getGameStateDB>>
>;

export async function getGameState(gameId: number) {
    const player = await getPlayer({ shouldRedirect: false });
    if (!player) return null;

    const cacheKey = `game:${gameId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
        console.log(`[CACHE HIT] ${cacheKey}`);
        const state = JSON.parse(cached) as ClientGameState;
        if (state.playerId !== player.id) return null;
        return state;
    }

    console.log(`[CACHE MISS] ${cacheKey} - fetching from DB`);

    const gameState = await getGameStateDB(gameId, player.id);
    if (!gameState) return null;

    await redis.set(cacheKey, JSON.stringify(gameState), "EX", 300); // 5 min ttl
    console.log(`[CACHE SET] ${cacheKey} - expires in 5 min`);
    return gameState;
}

export async function buyCard(
    gameId: number,
    cardId: string,
    position: number,
) {
    const player = await getPlayer({ shouldRedirect: false });
    if (!player) return { success: false as const, error: "Player not found" };

    const result = await prisma.$transaction(async (tx) => {
        const game = await tx.game.findUnique({
            where: {
                playerId: player.id,
                id: gameId,
            },
            include: {
                rounds: {
                    orderBy: { number: "desc" },
                    where: { status: RoundStatus.IN_PROGRESS },
                    select: { id: true, playerDeckId: true },
                    take: 1,
                },
            },
        });

        const latestRound = game?.rounds[0];
        if (!latestRound)
            return {
                success: false as const,
                error: "Game or round not found",
            };

        const cardCost = cards[cardId].metadata.price;
        try {
            const { bytes: newBytes } = await tx.round.update({
                where: {
                    id: latestRound.id,
                    status: RoundStatus.IN_PROGRESS,
                    bytes: { gte: cardCost },
                },
                data: {
                    bytes: {
                        decrement: cardCost,
                    },
                    playerDeck: {
                        update: {
                            cards: {
                                upsert: {
                                    where: {
                                        deckId_position: {
                                            deckId: latestRound.playerDeckId,
                                            position,
                                        },
                                    },
                                    create: { id: cardId, position },
                                    update: { id: cardId },
                                },
                            },
                        },
                    },
                },
            });

            return { success: true as const, bytes: newBytes };
        } catch (error) {
            if (
                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                error.code === "P2025"
            ) {
                return {
                    success: false as const,
                    error: "Insufficient bytes to buy card",
                };
            }
            throw error;
        }
    });

    if (result.success) invalidateGameCache(gameId);

    return result;
}

export async function sellCard(
    gameId: number,
    position: number,
    refundAmount: number,
) {
    const player = await getPlayer({ shouldRedirect: false });
    if (!player) return { success: false as const, error: "Player not found" };

    const result = await prisma.$transaction(async (tx) => {
        const game = await tx.game.findUnique({
            where: { id: gameId, playerId: player.id },
            include: {
                rounds: {
                    orderBy: { number: "desc" },
                    where: { status: RoundStatus.IN_PROGRESS },
                    include: {
                        playerDeck: {
                            select: { id: true },
                        },
                    },
                    take: 1,
                },
            },
        });

        const latestRound = game?.rounds[0];
        if (!latestRound)
            return {
                success: false as const,
                error: "Game or round not found",
            };

        const { bytes: newBytes } = await tx.round.update({
            where: { id: latestRound.id, status: RoundStatus.IN_PROGRESS },
            data: {
                bytes: {
                    increment: refundAmount,
                },
                playerDeck: {
                    update: {
                        cards: {
                            delete: {
                                deckId_position: {
                                    deckId: latestRound.playerDeck.id,
                                    position,
                                },
                            },
                        },
                    },
                },
            },
        });

        return {
            success: true as const,
            bytes: newBytes,
        };
    });

    if (result.success) invalidateGameCache(gameId);

    return result;
}

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
                where: { status: RoundStatus.IN_PROGRESS },
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

    const result = await prisma.$transaction(async (tx) => {
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

    invalidateGameCache(gameId);

    return result;
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
