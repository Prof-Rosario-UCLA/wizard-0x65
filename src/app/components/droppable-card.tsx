"use client";

import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";
import { CardMetadata } from "~/simulation/simulation";
import { Card } from "./card";

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
                <Card card={card} />
            ) : (
                <>
                    <div className="h-32 w-32" />
                    <div className="flex gap-8">
                        <div className="h-12 w-12" />
                        <div className="h-12 w-12" />
                    </div>
                </>
            )}
        </div>
    );
}
