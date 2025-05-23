import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "~/trpc/_app";

function handler(req: Request) {
    return fetchRequestHandler({
        endpoint: "/api/trpc",
        req,
        router: appRouter,
        createContext: (opts) => {
            return {};
        },
    });
}
export { handler as GET, handler as POST };
