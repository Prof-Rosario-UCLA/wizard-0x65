import { Round, RoundStatus } from "../generated/prisma";
import { Fragment } from "react";

interface GameSummaryProps {
    rounds: Round[];
}

export function GameSummary({ rounds }: GameSummaryProps) {
    return (
        <div className="flex flex-col gap-4 m-4">
            <h2 className="text-3xl">Game Over</h2>
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
            </div>
        </div>
    );
}
