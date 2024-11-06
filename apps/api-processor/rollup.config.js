import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/server.ts',
  cache: false,
  output: {
    dir: 'build',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [
    resolve(), // Locate and bundle dependencies in `node_modules`
    commonjs(), // Convert CommonJS modules to ES6
    json(),
    typescript(), // Compile TypeScript files
    terser(), // Minify for production
  ],
  external: ['openpgp', 'express'],
}
