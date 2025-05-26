import { GameController } from "../../components/game-controller";

export default async function GamePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return (
        <main className="mx-20">
            <GameController gameId={Number.parseInt(id)} />
        </main>
    );
}
