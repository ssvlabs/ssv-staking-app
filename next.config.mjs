import path from "path";

const emptyModule = "./lib/empty-module.ts";
const emptyModuleAbs = path.resolve(emptyModule);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    resolveAlias: {
      "@react-native-async-storage/async-storage": emptyModule,
      "pino-pretty": emptyModule
    }
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@react-native-async-storage/async-storage": emptyModuleAbs,
      "pino-pretty": emptyModuleAbs
    };
    return config;
  }
};

export default nextConfig;
