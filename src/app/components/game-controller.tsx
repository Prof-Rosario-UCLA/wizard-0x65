"use client";

import { Shop } from "./shop";
import { cards } from "~/simulation/cards";
import { Simulation } from "./simulation";
import {
    addCardToDeck,
    beginRound,
    buyCard,
    ClientGameState,
    sellCard,
} from "~/actions";
import { useEffect, useState } from "react";
import { GameSummary } from "./game-summary";
import { GameStatus } from "../generated/prisma";
import { CardMetadata } from "~/simulation/simulation";

interface GameControllerProps {
    gameState: ClientGameState;
}

export type Stage = "shop" | "simulation" | "complete";

export function GameController({
    gameState: defaultGameState,
}: GameControllerProps) {
    const [gameState, setGameState] = useState(defaultGameState);
    const [stage, setStage] = useState<Stage>(
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
                    const res = await buyCard(
                        gameState.id,
                        cards[cardId].metadata.price,
                    );
                    if (res.success) {
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
                                bytes: res.bytes ?? gameState.bytes,
                            };
                        });
                    }
                }}
                sellCard={async (position) => {
                    const card = gameState.deck[position];
                    if (!card) return;

                    const refundAmount = cards[card.id].metadata.price;

                    const res = await sellCard(gameState.id, refundAmount);

                    if (res.success) {
                        setGameState((gameState) => {
                            const newDeck = [...gameState.deck];
                            newDeck[position] = null;

                            return {
                                ...gameState,
                                deck: newDeck,
                                bytes: res.bytes ?? gameState.bytes,
                            };
                        });
                    }
                }}
                beginRound={async () => {
                    await beginRound(gameState.id);
                    setStage("simulation");
                }}
            />
        );
    }

    if (stage === "simulation")
        return (
            <Simulation
                // TODO: replace deep copy with the real enemy cards
                setStage={setStage}
                enemyDeck={
                    gameState.deck.map((card) => ({
                        ...card,
                    })) as CardMetadata[]
                }
                playerDeck={gameState.deck as (CardMetadata | null)[]}
            />
        );

    if (stage === "complete")
        return (
            <GameSummary
                deck={gameState.deck}
                rounds={gameState.rounds}
                setStage={setStage}
            />
        );
}
