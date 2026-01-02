const esbuild = require('esbuild');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

esbuild.build({
  entryPoints: [path.join(__dirname, '../src/renderer/index.tsx')],
  bundle: true,
  outfile: path.join(__dirname, '../dist/renderer/renderer/app.js'),
  platform: 'browser',
  target: 'es2020',
  format: 'iife',
  sourcemap: !isProduction,
  minify: isProduction,
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
    '.css': 'css',
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  external: ['electron'],
}).then(() => {
  console.log('Renderer build complete');
}).catch(() => process.exit(1));
