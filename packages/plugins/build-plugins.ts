import { build } from 'vite';
import { resolve } from 'path';
import { readdirSync } from 'fs';

async function buildPlugins() {
  const pluginsDir = resolve(__dirname, '../packages/plugins');
  const plugins = readdirSync(pluginsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const plugin of plugins) {
    console.log(`Building plugin: ${plugin}`);
    await build({
      configFile: resolve(pluginsDir, plugin, 'vite.config.ts')
    });
  }
}

buildPlugins().catch(console.error);