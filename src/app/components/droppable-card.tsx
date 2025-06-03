"use client";

import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";
import { CardMetadata } from "~/simulation/simulation";
import { Card } from "./card";
import { JavaCard } from "~/simulation/cards";

interface DroppableCardProps {
    id: UniqueIdentifier;
    position: number;
    card?: CardMetadata;
    onDoubleClick?: () => void;
}

export function DroppableCard({
    id,
    card,
    position,
    onDoubleClick,
}: DroppableCardProps) {
    const { isOver, setNodeRef } = useDroppable({
        id,
        data: {
            position,
        },
    });

    return (
        <figure
            ref={setNodeRef}
            className={`rounded w-fit mx-auto ${
                isOver ? "bg-runtime/60" : "bg-primary/40"
            }`}
            onDoubleClick={onDoubleClick}
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
        </figure>
    );
}
