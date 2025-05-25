// function Simulation() {
//     return (
//         <>
//             <div className="flex">
//                 <div className="border rounded-md px-4 py-2"></div>
//             </div>
//         </>
//     );
// }

import { Card } from "./card";

// export { Simulation };

export type SimulationProps = {};

export function Simulation(props: SimulationProps) {
    const {} = props;

    return (
        <>
            <div className="flex justify-center h-full">
                <div className="bg-gray-500 flex flex-col xl:flex-row w-full justify-between">
                    <div
                        id="player"
                        className="min-w-[45rem] bg-gray-200 h-full overflow-hidden flex justify-center items-center shrink"
                    >
                        <div className="flex gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Card key={i} name="ocaml" health={5} dmg={2} />
                            ))}
                        </div>
                    </div>
                    <div
                        id="enemy"
                        className="min-w-[45rem] bg-gray-300 h-full overflow-hidden flex justify-center items-center shrink"
                    >
                        <div className="flex gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div className="shrink" key={i}>
                                    <Card
                                        key={i}
                                        name="ocaml"
                                        health={5}
                                        dmg={2}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
