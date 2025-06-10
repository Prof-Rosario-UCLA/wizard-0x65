"use client";

import { CardMetadata } from "~/simulation/simulation";
import { DndContext } from "@dnd-kit/core";
import { DroppableCard } from "./droppable-card";
import { DraggableCard } from "./draggable-card";
import { useId } from "react";
import { Button } from "./button";
import { LoadingButton } from "./loading-button";
import { Tooltip } from "./tooltip";
import { Heading, SecHeading } from "./heading";
import { buyCard } from "~/actions";

interface ShopProps {
    cards: CardMetadata[];
    deck: (CardMetadata | null)[];
    bytes: number;
    health: number;
    takeCard(cardId: string, position: number): void;
    sellCard(position: number): void;
    beginRound(): void;
}

export function Shop({
    cards,
    deck,
    bytes,
    health,
    takeCard,
    beginRound,
    sellCard,
}: ShopProps) {
    const dndId = useId();
    return (
        <DndContext
            id={dndId}
            onDragEnd={(event) => {
                if (
                    event.over &&
                    event.over.id.toString().startsWith("shop:deck") &&
                    event.active.id.toString().startsWith("shop:item")
                ) {
                    const { position } = event.over.data.current!;
                    const data = event.active.data.current;
                    if (data && "cardId" in data) {
                        takeCard(data.cardId, position);
                    }
                }
            }}
        >
            <article className="flex flex-col justify-center items-center sm:h-screen h-[90vh] w-screen p-4">
                <Heading>Shop</Heading>
                <section className="flex flex-col sm:flex-row w-full h-full overflow-x-hidden overflow-y-scroll gap-4 bg-primary-lightest p-5 justify-between">
                    <figure className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {cards.map((card, i) => (
                            <DraggableCard
                                key={i}
                                id={`shop:item:${i}`}
                                metadata={card}
                                onDoubleClick={() => {
                                    const emptySlot = deck.findIndex(
                                        (slot) => slot === null,
                                    );
                                    if (emptySlot !== -1) {
                                        takeCard(card.id, emptySlot);
                                    } else {
                                        alert("No empty slots in your deck.");
                                    }
                                }}
                            />
                        ))}
                    </figure>
                    <div className="flex flex-col text-center items-center">
                        <SecHeading>Deck</SecHeading>

                        <div className="bg-primary-light w-full">
                            <figure className="grid lg:grid-cols-2 grid-cols-1 gap-2 p-4">
                                {deck.map((card, i) => (
                                    <DroppableCard
                                        key={i}
                                        id={`shop:deck:${i}`}
                                        position={i}
                                        card={card ?? undefined}
                                        onDoubleClick={() => {
                                            if (card) {
                                                sellCard(i);
                                            }
                                        }}
                                    />
                                ))}
                            </figure>

                            <section className="flex flex-row bg-primary text-white divide-x divide-white/60 p-2">
                                <div className="flex-1 p-2">
                                    <div className="flex gap-2 items-center justify-center">
                                        <div className="h-2 w-2 rounded-full bg-bytes"></div>
                                        {bytes} Bytes
                                    </div>
                                </div>
                                <div className="flex-1 p-2">
                                    <div className="flex gap-2 items-center justify-center">
                                        <div className="h-2 w-2 rounded-full bg-lives"></div>
                                        {health} Lives
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </section>
                <LoadingButton
                    className="mt-2 w-fit"
                    onClick={beginRound}
                    disabled={deck.some((card) => !card)}
                >
                    Begin Round
                </LoadingButton>
            </article>
        </DndContext>
    );
}
