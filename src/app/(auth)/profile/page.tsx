import { getAverageGameLength } from "~/actions";
import { getPlayer } from "~/auth";

export default async function Page() {
    const player = await getPlayer();

    const averageGameLength = await getAverageGameLength();
    return (
        <div>
            <p>Hello {player.email}</p>
            <p>
                Average game length:{" "}
                {averageGameLength ? averageGameLength.toFixed(2) : 0}
            </p>
            <a href="/api/auth/logout">Logout</a>
        </div>
    );
}
