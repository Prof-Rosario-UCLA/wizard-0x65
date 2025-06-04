import { cards } from "~/simulation/cards";
import { Deck } from "../types";
import { Card } from "./card";
import { Round, RoundStatus } from "../generated/prisma";
import { Dispatch, Fragment, SetStateAction } from "react";
import { Stage } from "./game-controller";
import { Button } from "./button";

interface GameSummaryProps {
    deck: Deck;
    rounds: Round[];
    setStage: Dispatch<SetStateAction<Stage>>;
}
export function GameSummary({ deck, rounds, setStage }: GameSummaryProps) {
    return (
        <div className="flex flex-col gap-4 m-4">
            <h2 className="text-3xl">Game Over</h2>
            {/* <div>
                <h2 className="text-2xl">Final Deck</h2>
                <div className="inline-grid grid-cols-4 gap-2">
                    {deck.map((card, i) => {
                        if (!card) return null;
                        return (
                            <Card key={i} metadata={cards[card.id].metadata} />
                        );
                    })}
                </div>
            </div> */}
            <div className="flex flex-col gap-2">
                <h3 className="text-2xl">Rounds</h3>
                <div>
                    <div className="inline-grid grid-cols-[repeat(4,_auto)] gap-4">
                        {rounds.map((round) => (
                            <Fragment key={round.id}>
                                <span className="font-bold underline">
                                    {round.number}
                                </span>
                                {round.status === RoundStatus.WIN ? (
                                    <span className="font-medium text-green-500">
                                        Victory
                                    </span>
                                ) : round.status === RoundStatus.LOSE ? (
                                    <span className="font-medium text-red-500">
                                        Defeat
                                    </span>
                                ) : (
                                    <span className="font-medium text-yellow-500">
                                        Draw
                                    </span>
                                )}
                                <span>❤️ {round.health}</span>
                                <span>🪙 {round.bytes}</span>
                            </Fragment>
                        ))}
                    </div>
                </div>
                <Button
                    onClick={() => {
                        setStage("shop");
                    }}
                >
                    Restart
                </Button>
            </div>
        </div>
    );
}
