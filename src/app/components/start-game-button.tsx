"use client";

import { createGame } from "~/actions";
import { useRouter } from "next/navigation";
import { LoadingButton } from "./loading-button";

export function StartGameButton() {
    const router = useRouter();

    return (
        <LoadingButton
            onClick={async () => {
                const { id } = await createGame();
                router.push(`/game/${id}`);
            }}
        >
            Start Game
        </LoadingButton>
    );
}
