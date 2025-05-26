"use client";

import { Shop } from "./shop";
import { cards } from "~/simulation/cards";
import { Simulation } from "./simulation";
import { addCardToDeck, getGameState } from "~/actions";
import { useState } from "react";
import { Deck } from "../types";

interface GameControllerProps {
    gameState: NonNullable<Awaited<ReturnType<typeof getGameState>>>;
}

export function GameController({ gameState }: GameControllerProps) {
    const { status, shop } = gameState;
    const [deck, setDeck] = useState<Deck>(gameState.deck);

    if (status === "SHOP") {
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
            />
        );
    }

    return <Simulation />;
}
