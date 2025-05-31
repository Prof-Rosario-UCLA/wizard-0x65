import { UniqueIdentifier, useDraggable } from "@dnd-kit/core";
import { Card, CardProps } from "./card";

interface DraggableCardProps extends CardProps {
    id: UniqueIdentifier;
}

export function DraggableCard(props: DraggableCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id: props.id,
            data: {
                cardId: props.metadata.id,
            },
        });

    const style = transform
        ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          }
        : undefined;

    return (
        <figure
            className={isDragging ? "z-6" : ""}
            style={style}
            {...listeners}
            {...attributes}
        >
            <Card ref={setNodeRef} {...props} />
        </figure>
    );
}
