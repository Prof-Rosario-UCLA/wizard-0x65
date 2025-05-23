import { signOut } from "~/auth";

export async function GET(request: Request) {
    await signOut({ redirectTo: "/login" });
}
