import { getAverageGameLength } from "~/actions";
import { getPlayer } from "~/auth";

export default async function Page() {
    const player = await getPlayer();

    const averageGameLength = await getAverageGameLength();
    return (
        <div>
            <p>Hello {player.email}</p>
            <p>Average game length: {averageGameLength.toFixed(2)}</p>
            <a href="/api/auth/logout">Logout</a>
        </div>
    );
}
