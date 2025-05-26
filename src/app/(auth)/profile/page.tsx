import { getPlayer } from "~/auth";

export default async function Page() {
    const player = await getPlayer();

    return (
        <div>
            <p>Hello {player?.email}</p>
            <a href="/api/auth/logout">Logout</a>
        </div>
    );
}
