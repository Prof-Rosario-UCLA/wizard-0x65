"use server";

import { redirect } from "next/navigation";
import { getPlayer } from "./auth";
import { prisma } from "./db";
import { DeckCard, GameStatus, RoundStatus } from "./app/generated/prisma";
import { cards } from "./simulation/cards";
import { Deck } from "./app/types";

function getRandomCard() {
    const cardIds = Object.keys(cards);
    return cardIds[Math.floor(Math.random() * cardIds.length)];
}

export async function createGame() {
    const player = await getPlayer({ shouldRedirect: false });
    if (!player) throw new Error("Player not found");

    const game = await prisma.game.create({
        data: {
            status: "SHOP",
            playerId: player.id,

            rounds: {
                create: {
                    playerDeck: { create: {} },
                    number: 1,
                    bytes: 8,
                    health: 3,
                    status: RoundStatus.IN_PROGRESS,
                    shopCards: {
                        create: Array.from({ length: 8 }, (_, i) => ({
                            cardId: getRandomCard(),
                            position: i,
                        })),
                    },
                },
            },
        },
    });

    redirect(`/game/${game.id}`);
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
        if (game.status !== GameStatus.SHOP)
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
    const player = await getPlayer();
    if (!player) return null;

    const game = await prisma.game.findUnique({
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
                            },
                        },
                    },
                },
            },
        },
    });

    const latestRound = game?.rounds[0];
    if (!game || !latestRound) return null;

    const deck: Deck = Array.from({ length: 4 }, () => null);
    for (const card of latestRound.playerDeck.cards) {
        deck[card.position] = card;
    }
    return {
        id: game.id,
        status: game.status,
        deck,
        shop: latestRound.shopCards,
        roundStatus: latestRound.status,
    };
}
