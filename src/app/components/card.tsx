import Image from "next/image";
import { forwardRef, ReactNode } from "react";
import { CardMetadata } from "~/simulation/simulation";
import { Tooltip } from "./tooltip";

export interface CardProps {
    metadata: CardMetadata;
    damage?: number;
    health?: number;
}

type InfoProps = {
    value: number;
    iconBg: string;
};

function InfoBox({ value, iconBg }: InfoProps) {
    return (
        <>
            <div className="bg-primary rounded-md text-white px-2 text-sm flex gap-2 items-center">
                <div className={`h-2 w-2 rounded-full ${iconBg}`}></div>
                {value}
            </div>
        </>
    );
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
                    className="text-xs sm:text-sm transition-all duration-200 ease-in-out group-hover:-translate-y-2 group-hover:shadow-xl/30 text-white"
                    aria-label={`Card: ${metadata.name}`}
                >
                    <div className="flex">
                        <div className="flex-col border-4 rounded border-primary bg-white relative">
                            <div className="absolute top-1 left-1 z-10">
                                <InfoBox
                                    value={metadata.price}
                                    iconBg="bg-bytes"
                                ></InfoBox>
                            </div>
                            <figure
                                id="banner"
                                className="m-4 h-16 w-18 xl:h-20 xl:w-24 relative"
                            >
                                <Image
                                    src={`/cards/${metadata.id}.png`}
                                    alt="card image"
                                    fill={true}
                                    className="object-contain"
                                />
                            </figure>
                            <div className="border border-white bg-primary/70 p-1">
                                <section className="bg-primary text-center w-full py-1 font-bold">
                                    {metadata.name}
                                </section>
                                <section className="text-center w-full py-1 flex gap-1 justify-between">
                                    <InfoBox
                                        value={metadata.baseHealth}
                                        iconBg="bg-runtime"
                                    />
                                    <InfoBox
                                        value={metadata.baseDamage}
                                        iconBg="bg-clockspeed"
                                    />
                                </section>
                            </div>
                        </div>
                    </div>
                </article>
            </Tooltip>
        </>
    );
});

export { Card };

{
    /* <section className="flex gap-8">
    <div id="dmg" className="h-6 w-6 xl:h-8 xl:w-8 relative">
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
    <div id="health" className="h-6 w-6 xl:h-8 xl:w-8 relative">
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
</section> */
}
