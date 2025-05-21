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
                <div className="border w-full h-full">
                    <Heading>Shop</Heading>

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
                            className="h-[80vh] w-[30vw] bg-gray-200"
                        ></div>
                    </div>
                </div>
            </div>
        </main>
    );
}
