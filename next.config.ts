import withPWA from "next-pwa";
import type { NextConfig } from "next";
import path from "path";

const baseConfig: NextConfig = {
    reactStrictMode: true,
    output: "standalone",
    webpack: (config) => {
        config.experiments.asyncWebAssembly = true;

        config.resolve = {
            ...config.resolve,
            alias: {
                ...(config.resolve?.alias || {}),
                "~": path.resolve(__dirname, "src"),
            },
        };
        config.resolve.fallback = { fs: false };

        return config;
    },
};

const runtimeCaching = [
    {
        urlPattern: /^\/$/, // homepage
        handler: "NetworkFirst",
        options: {
            cacheName: "start-page",
            expiration: { maxEntries: 1, maxAgeSeconds: 86400 },
            cacheableResponse: { statuses: [0, 200] },
        },
    },
    {
        urlPattern: /^\/game\/.*$/, // game/id page
        handler: "NetworkFirst",
        options: {
            cacheName: "game-pages",
            expiration: { maxEntries: 20, maxAgeSeconds: 86400 },
            cacheableResponse: { statuses: [0, 200] },
        },
    },
];

const config = withPWA({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
    runtimeCaching,
})(baseConfig);

export default config;
