import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	distDir: "build", // required for Google App Engine
	webpack: (config) => {
		config.experiments.asyncWebAssembly = true;
		return config;
	},
};

export default nextConfig;