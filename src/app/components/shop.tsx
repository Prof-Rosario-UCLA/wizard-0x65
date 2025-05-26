import { CardMetadata } from "~/simulation/simulation";
import { Card } from "./card";
import { BombCard } from "~/simulation/cards";
import Image from "next/image";

interface ShopProps {
    cards: CardMetadata[];
    deck: CardMetadata[];
}

export function Shop({ cards, deck }: ShopProps) {
    const placeholderDeckLength = 4 - deck.length;
    return (
        <div className="flex flex-col">
            <h1 className="relative mx-auto text-3xl text-white bg-neutral-600 inline-block py-1 px-16 top-7 z-10">
                Shop
            </h1>
            <div className="flex bg-neutral-200 p-5">
                <div className="m-10 grid grid-cols-4 gap-1">
                    {cards.map((card, i) => (
                        <Card key={i} card={card} />
                    ))}
                </div>
                <div className="flex flex-col gap-2 bg-neutral-400 p-4 text-center">
                    <h2 className="mx-auto text-3xl text-white bg-neutral-600 py-1 px-16">
                        Deck
                    </h2>

                    <div className="grid grid-cols-2 gap-2">
                        {deck.map((card, i) => (
                            <Card key={i} card={card} />
                        ))}
                        {Array.from(
                            { length: placeholderDeckLength },
                            (_, i) => (
                                <div
                                    key={i}
                                    className="flex-col border rounded-md p-4 bg-white animate-pulse"
                                >
                                    <div className="h-32 w-32" />
                                    <div className="flex gap-8">
                                        <div className="h-12 w-12" />
                                        <div className="h-12 w-12" />
                                    </div>
                                </div>
                            ),
                        )}
                    </div>

                    <div className="flex gap-2 mt-4 text-white">
                        <p className="bg-neutral-500 flex-1 p-4">8 Bytes</p>
                        <p className="bg-neutral-500 flex-1 p-4">Lives</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
