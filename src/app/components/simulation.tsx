import { JavaCard } from "~/simulation/cards";
import { Card } from "./card";
import { Heading } from "./heading";

// export { Simulation };

function SimulationPlayer({ isPlayer }) {
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
                        {(isPlayer
                            ? [...Array.from({ length: 4 })].reverse()
                            : Array.from({ length: 4 })
                        ).map((_, i) => {
                            const index = isPlayer ? 3 - i : i;
                            return (
                                <div
                                    className="flex flex-col items-center"
                                    key={i}
                                >
                                    <Card card={JavaCard.metadata} />
                                    <div className="h-[2px] mt-4 mb-2 w-full bg-black"></div>
                                    <div>{index}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}

export type SimulationProps = {};

export function Simulation(props: SimulationProps) {
    const {} = props;

    return (
        <>
            <div className="grid grid-cols-2 xl:h-screen h-full">
                <SimulationPlayer isPlayer={true} />
                <SimulationPlayer isPlayer={false} />
            </div>
        </>
    );
}
