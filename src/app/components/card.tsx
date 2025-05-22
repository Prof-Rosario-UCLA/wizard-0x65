// import Image from "next/image";

// function Card({ name }) {
//     return (
//         <>
//             <div className="flex-col h-[17rem] w-[12rem] relative border rounded-md">
//                 <div className="flex items-center justify-center">
//                     <div className="relative h-[10rem] w-[10rem] px-4 py-4">
//                         <Image
//                             src={`/cards/${name}.png`}
//                             alt="card image"
//                             fill={true}
//                             className="object-cover rounded-md"
//                         />
//                     </div>
//                 </div>
//                 {/* dmg and health */}
//                 <div className="flex w-full relative gap-10 justify-center">
//                     <div id="dmg" className="relative w-[4rem] h-[4rem]">
//                         <Image
//                             src={`/cards/ui_dmg.png`}
//                             alt="card image"
//                             fill={true}
//                             className="object-cover rounded-md"
//                         />
//                     </div>
//                     <div id="health" className="relative w-[4rem] h-[4rem]">
//                         <Image
//                             src={`/cards/ui_health.png`}
//                             alt="card image"
//                             fill={true}
//                             className="object-cover rounded-md"
//                         />
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// }

// export { Card };

import Image from "next/image";

function Card({ name, scale = 1, health = 0, dmg = 0 }) {
    return (
        <>
            <div
                className="origin-top-left inline-block "
                style={{ transform: `scale(${scale})` }}
            >
                <div className="flex">
                    <div className="flex-col border rounded-md p-4 bg-white">
                        <div id="banner" className="h-32 w-32 relative">
                            <Image
                                src={`/cards/${name}.png`}
                                alt="card image"
                                fill={true}
                                className="object-cover"
                            />
                        </div>
                        <div className="flex gap-8">
                            <div id="dmg" className="h-12 w-12 relative">
                                <div className="z-5 absolute top-1 left-3 font-bold text-3xl">
                                    {dmg}
                                </div>
                                <Image
                                    src={`/cards/ui_dmg.png`}
                                    alt="card image"
                                    fill={true}
                                    className="object-cover rounded-md"
                                />
                            </div>
                            <div id="health" className="h-12 w-12 relative">
                                {/* todo: give white text outline */}
                                <div className="z-5 absolute top-1 left-3.5 font-bold text-3xl">
                                    {health}
                                </div>

                                <Image
                                    src={`/cards/ui_health.png`}
                                    alt="card image"
                                    fill={true}
                                    className="object-cover rounded-md z-0"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export { Card };
