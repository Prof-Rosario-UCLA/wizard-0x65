import { CardMetadata } from "~/simulation/simulation";
import { Card } from "./card";

interface ShopProps {
    cards: CardMetadata[];
}

export function Shop({ cards }: ShopProps) {
    return (
        <div>
            <h1 className="text-center text-3xl text-white bg-zinc-700 inline p-4 px-16">
                Shop
            </h1>
            <div className="flex bg-gray-200">
                {cards.map((card, i) => (
                    <Card key={i} card={card} />
                ))}
            </div>
        </div>
    );
}
