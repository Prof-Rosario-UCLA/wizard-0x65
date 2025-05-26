"use server";

import { redirect } from "next/navigation";
import { getPlayer } from "./auth";
import { prisma } from "./db";
import { RoundStatus } from "./app/generated/prisma";
import { cards } from "./simulation/cards";

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
