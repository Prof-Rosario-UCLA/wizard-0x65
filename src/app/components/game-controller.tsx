"use client";

import { Shop } from "./shop";
import { cards } from "~/simulation/cards";
import { Simulation } from "./simulation";
import { addCardToDeck, beginRound, getGameState } from "~/actions";
import { useState } from "react";
import { Deck } from "../types";
import { Card } from "./card";

interface GameControllerProps {
    gameState: NonNullable<Awaited<ReturnType<typeof getGameState>>>;
}

export function GameController({ gameState }: GameControllerProps) {
    const { shop } = gameState;
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
                bytes={gameState.bytes}
                health={gameState.health}
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

    if (stage === "complete")
        return (
            <div>
                <h2 className="text-3xl">Game Complete</h2>
                <div className="inline-grid grid-cols-4 gap-2">
                    {deck.map((card, i) => {
                        if (!card) return null;
                        return <Card key={i} card={cards[card.id].metadata} />;
                    })}
                </div>
            </div>
        );
}
