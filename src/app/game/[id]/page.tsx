import { getGameState } from "~/actions";
import { GameController } from "../../components/game-controller";

export default async function GamePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const gameState = await getGameState(Number.parseInt(id));
    if (!gameState) return <div>Game not found.</div>;

    return (
        <main className="h-full">
            <GameController gameState={gameState} />
        </main>
    );
}
