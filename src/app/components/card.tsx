import Image from "next/image";
import { forwardRef } from "react";
import { CardMetadata } from "~/simulation/simulation";
import { Tooltip } from "./tooltip";

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
            <Tooltip
                description={metadata.description}
                name={metadata.name}
                health={metadata.baseHealth}
                damage={metadata.baseDamage}
                price={metadata.price}
            >
                <article
                    ref={ref}
                    className="transition-all duration-200 ease-in-out group-hover:-translate-y-2 group-hover:shadow-xl/30"
                    aria-label={`Card: ${metadata.name}`}
                >
                    <div className="flex">
                        <div className="flex-col border rounded-md p-4 bg-white">
                            <figure
                                id="banner"
                                className="h-18 w-18 xl:h-24 xl:w-24 relative"
                            >
                                <Image
                                    src={`/cards/${metadata.id}.png`}
                                    alt="card image"
                                    fill={true}
                                    className="object-contain"
                                />
                            </figure>
                            <section className="flex gap-8">
                                <div
                                    id="dmg"
                                    className="h-6 w-6 xl:h-8 xl:w-8 relative"
                                >
                                    <div className="z-5 absolute top-0 left-2 font-bold text-xl xl:text-2xl text-fuchsia-600 text-outline-white">
                                        {damage}
                                    </div>
                                    <Image
                                        src={`/cards/ui_dmg.png`}
                                        alt="card image"
                                        fill={true}
                                        className="object-contain rounded-md"
                                    />
                                </div>
                                <div
                                    id="health"
                                    className="h-6 w-6 xl:h-8 xl:w-8 relative"
                                >
                                    {/* todo: give white text outline */}
                                    <div className="z-5 absolute top-0 left-2 font-bold text-xl xl:text-2xl text-pink-600 text-outline-white">
                                        {health}
                                    </div>

                                    <Image
                                        src={`/cards/ui_health.png`}
                                        alt="card image"
                                        fill={true}
                                        className="object-contain rounded-md z-0"
                                    />
                                </div>
                            </section>
                        </div>
                    </div>
                </article>
            </Tooltip>
        </>
    );
});

export { Card };
