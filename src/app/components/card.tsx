import Image from "next/image";
import { forwardRef } from "react";
import { CardMetadata } from "~/simulation/simulation";

export interface CardProps {
    metadata: CardMetadata;
    damage?: number;
    health?: number;
}

const Card = forwardRef<HTMLDivElement, CardProps>((props, ref) => {
    const {
        metadata,
        health = metadata.baseHealth,
        damage = metadata.baseDamage,
    } = props;
    return (
        <>
            <div ref={ref} className="">
                <div className="flex">
                    <div className="flex-col border rounded-md p-4 bg-white">
                        <div
                            id="banner"
                            className="h-18 w-18 xl:h-24 xl:w-24 relative"
                        >
                            <Image
                                src={`/cards/${metadata.id}.png`}
                                alt="card image"
                                fill={true}
                                className="object-cover"
                            />
                        </div>
                        <div className="flex gap-8">
                            <div
                                id="dmg"
                                className="h-6 w-6 xl:h-8 xl:w-8 relative"
                            >
                                <div className="z-5 absolute top-0 left-2 font-bold text-xl xl:text-2xl text-red-900">
                                    {damage}
                                </div>
                                <Image
                                    src={`/cards/ui_dmg.png`}
                                    alt="card image"
                                    fill={true}
                                    className="object-cover rounded-md"
                                />
                            </div>
                            <div
                                id="health"
                                className="h-6 w-6 xl:h-8 xl:w-8 relative"
                            >
                                {/* todo: give white text outline */}
                                <div className="z-5 absolute top-0 left-2 font-bold text-xl xl:text-2xl text-red-900">
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
});

export { Card };
