import { getGameState } from "~/actions";
import { GameController } from "../../components/game-controller";

export default async function GamePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const parsedId = Number.parseInt(id);
    const gameState = await getGameState(parsedId);
    if (!gameState) return <div>Game not found.</div>;

    return (
        <main className="h-full">
            <GameController
                gameState={gameState}
                getGameState={async () => {
                    "use server";
                    const gameState = await getGameState(parsedId);
                    if (!gameState) throw new Error("Game not found.");

                    return gameState;
                }}
            />
        </main>
    );
}
