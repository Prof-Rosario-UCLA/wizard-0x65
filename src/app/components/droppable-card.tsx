"use client";

import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";
import { CardMetadata } from "~/simulation/simulation";
import { Card } from "./card";
import { JavaCard } from "~/simulation/cards";

interface DroppableCardProps {
    id: UniqueIdentifier;
    position: number;
    card?: CardMetadata;
}

export function DroppableCard({ id, card, position }: DroppableCardProps) {
    const { isOver, setNodeRef } = useDroppable({
        id,
        data: {
            position,
        },
    });

    return (
        <div
            ref={setNodeRef}
            className={`border-5 ${
                isOver ? "border-green-500" : "border-neutral-500"
            }`}
        >
            {card ? (
                <Card metadata={card} />
            ) : (
                <>
                    <div className="invisible">
                        <Card metadata={JavaCard.metadata} />
                    </div>
                </>
            )}
        </div>
    );
}
