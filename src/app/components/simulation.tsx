import { JavaCard } from "~/simulation/cards";
import { Card } from "./card";
import { Heading } from "./heading";
import { CardMetadata } from "~/simulation/simulation";

// export { Simulation };

interface SimPlayerProps {
    isPlayer: boolean;
    deck: (CardMetadata | null)[];
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
                            (cardData, i) => {
                                const index = isPlayer ? 3 - i : i;
                                return (
                                    <div
                                        className="flex flex-col items-center"
                                        key={i}
                                    >
                                        {cardData && <Card card={cardData} />}
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
}

export function Simulation({ enemyDeck, playerDeck }: SimProps) {
    return (
        <>
            <div className="grid grid-cols-2 xl:h-screen h-full">
                <SimulationPlayer isPlayer={true} deck={playerDeck} />
                <SimulationPlayer isPlayer={false} deck={enemyDeck} />
            </div>
        </>
    );
}
