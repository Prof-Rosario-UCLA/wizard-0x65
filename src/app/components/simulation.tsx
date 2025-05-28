"use client";

import { cards, JavaCard } from "~/simulation/cards";
import { Card, CardProps } from "./card";
import { Heading } from "./heading";
import { CardMetadata, Game, GameState } from "~/simulation/simulation";
import React, { Dispatch, SetStateAction } from "react";
import { Stage } from "./game-controller";

// export { Simulation };

interface SimPlayerProps {
    isPlayer: boolean;
    deck: CardProps[];
}

function SimulationPlayer({ isPlayer, deck }: SimPlayerProps) {
    return (
        <>
            <div
                className={`flex p-8 flex-col justify-between relative items-center justify-center ${
                    isPlayer ? "bg-gray-200" : ""
                }`}
            >
                <div className="relative xl:absolute top-0 left-0 py-8">
                    <Heading>{isPlayer ? "Player" : "Enemy"}</Heading>
                </div>
                <div
                    id="player"
                    className="h-full flex justify-center items-center shrink"
                >
                    <div
                        className={`flex ${
                            isPlayer ? "flex-col-reverse" : "flex-col"
                        } xl:flex-row gap-4`}
                    >
                        {(isPlayer ? [...deck].reverse() : deck).map(
                            (cardProps, i) => {
                                const index = isPlayer ? 3 - i : i;
                                return (
                                    <div
                                        className="flex flex-col items-center"
                                        key={i}
                                    >
                                        {cardProps && <Card {...cardProps} />}
                                        <div className="h-[2px] mt-4 mb-2 w-full bg-black"></div>
                                        <div>{index}</div>
                                    </div>
                                );
                            },
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

interface SimProps {
    enemyDeck: CardMetadata[];
    playerDeck: (CardMetadata | null)[];
    setStage: Dispatch<SetStateAction<Stage>>;
}

const SIMULATE_INTERVAL = 200;

export function Simulation({ enemyDeck, playerDeck, setStage }: SimProps) {
    const gameRef = React.useRef<Game>(null);
    const [playerCardData, setPlayerCardData] = React.useState<CardProps[]>([]);
    const [enemyCardData, setEnemyCardData] = React.useState<CardProps[]>([]);

    const updateCardData = React.useCallback(() => {
        setPlayerCardData(
            gameRef.current!.playerDeck.map((card) => ({
                metadata: card.metadata,
                health: card.health,
                damage: card.damage,
            })),
        );
        setEnemyCardData(
            gameRef.current!.enemyDeck.map((card) => ({
                metadata: card.metadata,
                health: card.health,
                damage: card.damage,
            })),
        );
    }, [gameRef.current, setPlayerCardData, setEnemyCardData]);

    React.useEffect(() => {
        const player = playerDeck
            .filter((x) => x !== null)
            .map(({ id }) => {
                const CardClass = cards[id];
                return new CardClass();
            });
        const enemy = enemyDeck.map(({ id }) => {
            const CardClass = cards[id];
            return new CardClass();
        });

        gameRef.current = new Game(player, enemy);
        updateCardData();

        let timeout: NodeJS.Timeout | null = setInterval(() => {
            gameRef.current!.step();
            updateCardData();
            const state = gameRef.current!.gameState;
            if (state === GameState.Over) {
                setTimeout(() => {
                    setStage("complete");
                }, 1000);
                if (timeout) {
                    clearInterval(timeout);
                }
                timeout = null;
            }
        }, SIMULATE_INTERVAL);

        return () => {
            if (timeout) {
                clearInterval(timeout);
            }
        };
    }, []);

    return (
        <>
            <div className="grid grid-cols-2 xl:h-screen h-full">
                <SimulationPlayer isPlayer={true} deck={playerCardData} />
                <SimulationPlayer isPlayer={false} deck={enemyCardData} />
            </div>
        </>
    );
}
