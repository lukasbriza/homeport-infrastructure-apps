import babel from '@rollup/plugin-babel'
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
    resolve(),
    commonjs(),
    json(),
    typescript(),
    babel({
      extensions: ['.js', '.mjs', '.ts'],
      babelHelpers: 'bundled',
      presets: ['@babel/preset-env', '@babel/preset-typescript'],
    }),
    terser(),
  ],
  external: ['openpgp', 'express', 'yup', 'pm2'],
}
