"use client";

import { Shop } from "./shop";
import { cards } from "~/simulation/cards";
import { Simulation } from "./simulation";
import { addCardToDeck, beginRound, ClientGameState } from "~/actions";
import { useEffect, useState } from "react";
import { GameSummary } from "./game-summary";
import { GameStatus } from "../generated/prisma";

interface GameControllerProps {
    gameState: ClientGameState;
}

export function GameController({
    gameState: defaultGameState,
}: GameControllerProps) {
    const [gameState, setGameState] = useState(defaultGameState);
    const [stage, setStage] = useState<"shop" | "simulation" | "complete">(
        gameState.status === GameStatus.IN_PROGRESS ? "shop" : "complete",
    );

    useEffect(() => {
        setGameState(defaultGameState);
    }, [defaultGameState]);

    if (stage === "shop") {
        return (
            <Shop
                cards={gameState.shop.map(
                    (card) => cards[card.cardId].metadata,
                )}
                deck={gameState.deck.map((card) =>
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
                    setGameState((gameState) => {
                        const newDeck = [...gameState.deck];
                        newDeck[position] = { id: cardId };
                        return {
                            ...gameState,
                            deck: newDeck,
                        };
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
        return <GameSummary deck={gameState.deck} rounds={gameState.rounds} />;
}
