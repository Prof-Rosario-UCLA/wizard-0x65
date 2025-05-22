import Link from "next/link";
import { Button } from "../components/button";
import { Heading } from "../components/heading";
import { CardProps } from "../types";
import { Card } from "../components/card";

let deckCards: CardProps[] = [];
let shopCards: CardProps[] = [];

export default function Shop() {
    return (
        <main>
            <div className="px-24 py-10">
                <div className="border w-full h-full relative">
                    <Heading>Shop</Heading>
                    <Link
                        href="/game"
                        className="absolute top-0 right-0 text-xl"
                    >
                        <Button>Start game</Button>
                    </Link>

                    {/* <Link href="/">
                        <Button>Back</Button>
                    </Link> */}
                    <div className="flex">
                        <div
                            id="shop-area"
                            className="h-[80vh] w-[60vw] bg-gray-500 flex flex-wrap justify-center items-center gap-6"
                        >
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Card key={i} name="ocaml" health={5} dmg={2} />
                            ))}
                        </div>

                        <div
                            id="deck"
                            className="h-[80vh] w-[30vw] bg-gray-200 flex flex-wrap justify-center items-center gap-6"
                        >
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Card key={i} name="ocaml" health={5} dmg={2} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
