import { createRequire } from 'node:module';
import { fs, path } from '@vuepress/utils';

const require = createRequire(import.meta.url);
export const version = fs.readJsonSync(
  require.resolve('../../../package.json')
).version;
