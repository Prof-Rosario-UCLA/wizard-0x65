// function Simulation() {
//     return (
//         <>
//             <div className="flex">
//                 <div className="border rounded-md px-4 py-2"></div>
//             </div>
//         </>
//     );
// }

import { JavaCard } from "~/simulation/cards";
import { Card } from "./card";
import { Heading } from "./heading";

// export { Simulation };

function SimulationPlayer({ isPlayer }) {
    return (
        <>
            <div className="bg-gray-500 flex w-full h-full justify-between relative">
                <div className="absolute top-5 left-5">
                    <Heading>{isPlayer ? "Player" : "Enemy"}</Heading>
                </div>
                <div
                    id="player"
                    className="min-w-[45rem] bg-gray-200 h-full overflow-hidden flex justify-center items-center shrink"
                >
                    <div className="flex gap-4">
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
            <div className="flex flex-col xl:flex-row justify-center h-full">
                <SimulationPlayer isPlayer={true} />
                <SimulationPlayer isPlayer={false} />
            </div>
        </>
    );
}
