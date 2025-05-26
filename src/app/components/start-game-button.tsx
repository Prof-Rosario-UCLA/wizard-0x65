"use client";

import { createGame } from "~/actions";
import { Button } from "./button";
import { redirect } from "next/navigation";

export function StartGameButton() {
    return (
        <Button
            className="cursor-pointer"
            onClick={async () => {
                const { id } = await createGame();
                redirect(`/game/${id}`);
            }}
        >
            Start Game
        </Button>
    );
}
