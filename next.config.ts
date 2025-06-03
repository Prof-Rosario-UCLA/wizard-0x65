// next.config.ts
import withPWA from "next-pwa";
import type { NextConfig } from "next";
import path from "path";

const baseConfig: NextConfig = {
    reactStrictMode: true,
    output: "standalone",
    webpack: (config) => {
        config.experiments.asyncWebAssembly = true;

        // Add alias for "~"
        config.resolve = {
            ...config.resolve,
            alias: {
                ...(config.resolve?.alias || {}),
                "~": path.resolve(__dirname, "src"),
            },
        };

        return config;
    },
};

const config = withPWA({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
})(baseConfig);

export default config;
