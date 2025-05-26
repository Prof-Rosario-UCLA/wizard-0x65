"use client";

import { Shop } from "./shop";
import { cards } from "~/simulation/cards";
import { Simulation } from "./simulation";
import { addCardToDeck, beginRound, getGameState } from "~/actions";
import { useState } from "react";
import { Deck } from "../types";
import { GameStatus } from "../generated/prisma";

interface GameControllerProps {
    gameState: NonNullable<Awaited<ReturnType<typeof getGameState>>>;
}

export function GameController({ gameState }: GameControllerProps) {
    const { status, shop } = gameState;
    const [deck, setDeck] = useState<Deck>(gameState.deck);
    const [stage, setStage] = useState<"shop" | "simulation" | "complete">(
        gameState.status === "IN_PROGRESS" ? "shop" : "complete",
    );

    if (stage === "shop") {
        return (
            <Shop
                cards={shop.map((card) => cards[card.cardId].metadata)}
                deck={deck.map((card) =>
                    card ? cards[card.id].metadata : null,
                )}
                takeCard={async (cardId, position) => {
                    await addCardToDeck({
                        gameId: gameState.id,
                        cardId,
                        position,
                    });
                    setDeck((deck) => {
                        const newDeck = [...deck];
                        newDeck[position] = { id: cardId };
                        return newDeck;
                    });
                }}
                beginRound={async () => {
                    await beginRound(gameState.id);
                    setStage("simulation");
                }}
            />
        );
    }

    if (stage === "simulation") return <Simulation />;

    if (stage === "complete") return <div>Game complete.</div>;
}
