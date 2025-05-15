import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	output: 'standalone',
	webpack: (config) => {
		config.experiments.asyncWebAssembly = true;
		return config;
	},
};

export default nextConfig;
