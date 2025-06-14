"use client";

import { cards } from "~/simulation/cards";
import { Card, CardProps } from "./card";
import { Heading } from "./heading";
import {
    CardMetadata,
    Game,
    GameState,
    WinState,
} from "~/simulation/simulation";
import { useEffect, useRef, useCallback, useState } from "react";

interface SimPlayerProps {
    isPlayer: boolean;
    deck: CardProps[];
}

export function SimulationPlayer({ isPlayer, deck }: SimPlayerProps) {
    return (
        <>
            <section
                className={`flex h-full p-8 flex-col justify-between relative items-center ${
                    isPlayer ? "bg-primary/10" : ""
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
                                        <div className="h-[4px] rounded-full mt-4 mb-2 w-full bg-primary"></div>
                                        <div className="text-primary">
                                            {index}
                                        </div>
                                    </div>
                                );
                            },
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}

interface SimProps {
    enemyDeck: (CardMetadata | null)[];
    playerDeck: (CardMetadata | null)[];
    onFinish: (winState: WinState) => void;
}

const SIMULATE_INTERVAL = 200;

export function Simulation({ enemyDeck, playerDeck, onFinish }: SimProps) {
    const gameRef = useRef<Game>(null);
    const [playerCardData, setPlayerCardData] = useState<CardProps[]>([]);
    const [enemyCardData, setEnemyCardData] = useState<CardProps[]>([]);

    const updateCardData = useCallback(() => {
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

    useEffect(() => {
        const player = playerDeck
            .filter((x) => x !== null)
            .map(({ id }) => {
                const CardClass = cards[id];
                return new CardClass();
            });
        const enemy = enemyDeck
            .filter((x) => x !== null)
            .map(({ id }) => {
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
                setTimeout(() => onFinish(gameRef.current!.winState), 1000);
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
            <div className="h-screen w-screen flex items-center justify-center">
                <div className="h-[96vh] w-[96vw] bg-primary-lightest grid grid-cols-2 overflow-y-scroll">
                    <SimulationPlayer isPlayer={true} deck={playerCardData} />
                    <SimulationPlayer isPlayer={false} deck={enemyCardData} />
                </div>
            </div>
        </>
    );
}
