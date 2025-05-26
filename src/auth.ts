import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { redirect } from "next/navigation";
import { Player, PrismaClient } from "./app/generated/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID ?? "",
            clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
        }),
    ],
});

export type GetUserParams<TShouldRedirect extends boolean> = {
    shouldRedirect?: TShouldRedirect;
};

export async function getPlayer<TShouldRedirect extends boolean = true>(
    params?: GetUserParams<TShouldRedirect>,
): Promise<TShouldRedirect extends true ? Player : Player | null> {
    const { shouldRedirect = true } = params ?? {};

    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
        if (shouldRedirect) {
            redirect("/login");
        }
        return null as any;
    }
    const prisma = new PrismaClient();
    const player = prisma.player.upsert({
        where: { email },
        update: {},
        create: {
            email,
        },
    });

    return player;
}
