"use client";

import { createGame } from "~/actions";
import { Button } from "./button";

export function StartGameButton({}) {
    return (
        <Button
            className="cursor-pointer"
            onClick={async () => {
                const id = await createGame();
            }}
        >
            Start Game
        </Button>
    );
}
