const { getDefaultConfig } = require("expo/metro-config");
const fs = require("fs");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
config.resolver.unstable_enableSymlinks = true;
config.resolver.extraNodeModules = {
  "@psx/domain": path.resolve(workspaceRoot, "packages/domain"),
};

/**
 * Domain sources are TypeScript ESM (`from "./foo.js"`). Metro otherwise looks
 * for a literal foo.js and never tries foo.ts.
 */
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith(".") && moduleName.endsWith(".js")) {
    const originDir = path.dirname(context.originModulePath);
    const tsPath = path.resolve(originDir, moduleName.replace(/\.js$/, ".ts"));
    if (fs.existsSync(tsPath)) {
      return context.resolveRequest(context, moduleName.replace(/\.js$/, ".ts"), platform);
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
