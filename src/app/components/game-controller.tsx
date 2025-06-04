"use client";

import { Shop } from "./shop";
import { cards } from "~/simulation/cards";
import { Simulation } from "./simulation";
import { beginRound, buyCard, ClientGameState, sellCard } from "~/actions";
import { useEffect, useState } from "react";
import { GameSummary } from "./game-summary";
import { GameStatus } from "../generated/prisma";
import { WinState } from "~/simulation/simulation";

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
                deck={gameState.playerDeck.map((card) =>
                    card ? cards[card.id].metadata : null,
                )}
                bytes={gameState.bytes}
                health={gameState.health}
                takeCard={async (cardId, position) => {
                    const res = await buyCard(gameState.id, cardId, position);
                    console.log(res);
                    if (res.success) {
                        setGameState((gameState) => {
                            const newDeck = [...gameState.playerDeck];
                            newDeck[position] = { id: cardId };
                            return {
                                ...gameState,
                                playerDeck: newDeck,
                                bytes: res.bytes ?? gameState.bytes,
                            };
                        });
                    } else alert("Not enough bytes!");
                }}
                sellCard={async (position) => {
                    const card = gameState.playerDeck[position];
                    if (!card) return;

                    const refundAmount = cards[card.id].metadata.price;

                    const res = await sellCard(
                        gameState.id,
                        position,
                        refundAmount,
                    );

                    if (res.success) {
                        setGameState((gameState: ClientGameState) => {
                            const newDeck = [...gameState.playerDeck];
                            newDeck[position] = null;

                            return {
                                ...gameState,
                                playerDeck: newDeck,
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
                enemyDeck={gameState.enemyDeck.map((card) =>
                    card ? cards[card.id].metadata : null,
                )}
                playerDeck={gameState.playerDeck.map((card) =>
                    card ? cards[card.id].metadata : null,
                )}
                onFinish={(winState) => {
                    if (winState === WinState.Enemy) {
                        const health = gameState.health - 1;
                        setGameState((gameState) => ({
                            ...gameState,
                            health: gameState.health - 1,
                        }));
                        if (health === 1) {
                            setStage("complete");
                            return;
                        }
                    }
                    setStage("shop");
                }}
            />
        );

    if (stage === "complete")
        return (
            <GameSummary
                deck={gameState.playerDeck}
                rounds={gameState.rounds}
                setStage={setStage}
            />
        );
}
