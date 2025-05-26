import { getPlayer } from "~/auth";
import { Button } from "./components/button";
import Link from "next/link";
import { StartGameButton } from "./components/start-game-button";

export default async function Home() {
    const player = await getPlayer({ shouldRedirect: false });

    return (
        <main>
            <div className="h-screen flex flex-col gap-2 items-center justify-center">
                <h1 className="text-center font-bold text-3xl">Wizard 0x65</h1>
                {player ? (
                    <StartGameButton />
                ) : (
                    <Button
                        as={Link}
                        className="cursor-pointer"
                        href="/api/auth/login"
                    >
                        Login
                    </Button>
                )}
            </div>
        </main>
    );
}
