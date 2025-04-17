import { getDefaultConfig } from 'expo/metro-config';
import path from 'path';

const config = getDefaultConfig(process.cwd());

config.resolver.extraNodeModules = {
  '~': path.resolve(process.cwd()),
};

config.watchFolders = [path.resolve(process.cwd())];

export default config;